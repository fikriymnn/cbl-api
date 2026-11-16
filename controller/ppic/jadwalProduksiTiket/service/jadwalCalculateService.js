// Calculate jadwal produksi tiket (hitung mundur dari target FG = H-2 hari kerja).
// Lihat docs/plan-edit-jadwal-produksi.md bagian 6.2.
const db = require("../../../../config/database");
const TiketJadwalProduksi = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiModel");
const TiketJadwalProduksiTahapan = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiTahapanModel");
const TiketJadwalProduksiPerJam = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiPerJamModel");
const { loadShiftContext } = require("./jadwalShiftHelper");
const { loadOccupancy, loadMesinMeta } = require("./jadwalOccupancyHelper");
const {
  addHours,
  floorHour,
  ceilHour,
  startOfDay,
  fmtDate,
  fmtTime,
  fmtDateTime,
  fmtTglFromTo,
  layForward,
  layBackward,
} = require("./jadwalLayoutHelper");

// jumlah hari kerja antara target FG dan tanggal kirim (spare)
const SPARE_HARI_KERJA = 2;
// jatah tahapan "tgl" (Plate / mesin tidak ada di master)
const HARI_KERJA_TAHAPAN_TGL = 2;

const httpError = (status, payload) => {
  const err = new Error(
    typeof payload === "string" ? payload : payload.msg || "error"
  );
  err.status = status;
  err.payload = typeof payload === "string" ? { msg: payload } : payload;
  return err;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const num = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));

const toTiket = (row) => ({
  id: row.id,
  item: row.item,
  no_jo: row.no_jo,
  no_booking: row.no_booking,
  tgl_kirim: row.tgl_kirim,
  tgl_kirim_date: row.tgl_kirim_date,
  tgl_cetak: row.tgl_cetak,
  tgl_target_fg: row.tgl_target_fg,
  qty_pcs: num(row.qty_pcs),
  qty_druk: num(row.qty_druk),
  status: row.status,
  status_tiket: row.status_tiket,
});

const toStage = (row) => {
  const from = row.from;
  return {
    id: row.id,
    id_tiket_jadwal_produksi: row.id_tiket_jadwal_produksi,
    item: row.item,
    tahapan: row.tahapan,
    tahapan_ke: row.tahapan_ke,
    from,
    // tahapan tanpa slot per jam: Plate / mesin tidak ada di master
    isTgl: from !== "druk" && from !== "pcs",
    nama_kategori: row.nama_kategori,
    kategori: row.kategori,
    kategori_drying_time: row.kategori_drying_time,
    id_tahapan: row.id_tahapan,
    id_mesin: row.id_mesin,
    mesin: row.mesin,
    kapasitas_per_jam: num(row.kapasitas_per_jam),
    drying_time: num(row.drying_time),
    setting: num(row.setting),
    kapasitas: num(row.kapasitas),
    toleransi: num(row.toleransi),
    total_waktu: num(row.total_waktu),
    total_waktu_produksi: num(row.total_waktu_produksi),
    durasi: 0,
    mulai: null,
    selesai: null,
    drying_mulai: null,
    drying_selesai: null,
    slots: [],
  };
};

const sortStages = (stages) =>
  stages.sort((a, b) => a.tahapan_ke - b.tahapan_ke || a.id - b.id);

// tanggal kirim (jam 00:00 lokal)
const parseTglKirim = (tiket) => {
  let d = tiket.tgl_kirim ? new Date(tiket.tgl_kirim) : null;
  if (!d || isNaN(d)) d = tiket.tgl_kirim_date ? new Date(tiket.tgl_kirim_date) : null;
  if (!d || isNaN(d)) return null;
  return startOfDay(d);
};

// kapasitas (jam) & total waktu, rumus sama dengan calculate sebelumnya
const computeDuration = (stage, tiket) => {
  if (stage.from === "druk" && stage.kapasitas_per_jam != 0) {
    stage.kapasitas = tiket.qty_druk / stage.kapasitas_per_jam;
  } else if (stage.from === "pcs" && stage.kapasitas_per_jam != 0) {
    stage.kapasitas = tiket.qty_pcs / stage.kapasitas_per_jam;
  } else {
    stage.kapasitas = 0;
  }
  const hoursSettingUp = stage.setting != 0 ? Math.ceil(stage.setting / 60) : 0;
  stage.total_waktu_produksi = hoursSettingUp + stage.kapasitas;
  stage.total_waktu = stage.drying_time + hoursSettingUp + stage.kapasitas;
  stage.durasi = stage.isTgl ? 0 : Math.ceil(stage.total_waktu_produksi);
  return stage;
};

const setDrying = (stage) => {
  stage.drying_mulai = stage.selesai;
  stage.drying_selesai = addHours(stage.selesai, stage.drying_time || 0);
};

const layOptions = (stage, { ctx, occ, meta, skipOccupied }) => ({
  durasi: stage.durasi,
  isWorking: (t) => ctx.isWorkingHour(t, stage.mesin),
  isBlocked:
    skipOccupied && occ && !meta.allowConcurrent(stage)
      ? (t) => !!occ.get(t, stage)
      : null,
});

/**
 * Susun tahapan MAJU mulai `start`. Return false kalau tidak ketemu jam kerja.
 */
const placeForward = (stage, start, env) => {
  if (stage.isTgl) {
    stage.slots = [];
    stage.mulai = new Date(start);
    stage.selesai = env.ctx.addWorkingDays(start, HARI_KERJA_TAHAPAN_TGL);
  } else {
    const slots = layForward({ start, ...layOptions(stage, env) });
    if (!slots) return false;
    stage.slots = slots;
    stage.mulai = slots.length ? slots[0] : ceilHour(start);
    stage.selesai = slots.length
      ? addHours(slots[slots.length - 1], 1)
      : stage.mulai;
  }
  setDrying(stage);
  return true;
};

/**
 * Susun tahapan MUNDUR sehingga selesai paling lambat `end`.
 */
const placeBackward = (stage, end, env) => {
  if (stage.isTgl) {
    stage.slots = [];
    stage.selesai = new Date(end);
    stage.mulai = env.ctx.subtractWorkingDays(end, HARI_KERJA_TAHAPAN_TGL);
  } else {
    const slots = layBackward({ end, ...layOptions(stage, env) });
    if (!slots) return false;
    stage.slots = slots;
    stage.mulai = slots.length ? slots[0] : floorHour(end);
    stage.selesai = slots.length
      ? addHours(slots[slots.length - 1], 1)
      : stage.mulai;
  }
  setDrying(stage);
  return true;
};

/* ---- unit penjadwalan ----
 * Tahapan "tgl" yang berurutan membentuk satu GRUP yang berbagi jendela
 * 2 hari kerja yang sama (perilaku calculate sebelumnya) dan selalu bergeser
 * bersama. Tahapan lain = unit sendiri. FG (tahapan terakhir) tidak masuk unit.
 */
const buildUnits = (stages) => {
  const units = [];
  const last = stages.length - 1;
  for (let i = 0; i < last; i++) {
    const prev = units[units.length - 1];
    if (stages[i].isTgl && prev && prev.isTgl) prev.idx.push(i);
    else units.push({ idx: [i], isTgl: stages[i].isTgl });
  }
  return units;
};

const unitStages = (stages, u) => u.idx.map((i) => stages[i]);
const unitMulai = (stages, u) => stages[u.idx[0]].mulai;
const unitDryingSelesai = (stages, u) =>
  unitStages(stages, u).reduce(
    (max, s) => (s.drying_selesai > max ? s.drying_selesai : max),
    stages[u.idx[0]].drying_selesai
  );
const unitMaxDrying = (stages, u) =>
  Math.max(...unitStages(stages, u).map((s) => s.drying_time || 0));

const setTglWindow = (stages, u, mulai, selesai) => {
  for (const s of unitStages(stages, u)) {
    s.slots = [];
    s.mulai = new Date(mulai);
    s.selesai = new Date(selesai);
    setDrying(s);
  }
};

const placeUnitForward = (stages, u, start, env) => {
  if (!u.isTgl) return placeForward(stages[u.idx[0]], start, env);
  setTglWindow(stages, u, start, env.ctx.addWorkingDays(start, HARI_KERJA_TAHAPAN_TGL));
  return true;
};

const placeUnitBackward = (stages, u, end, env) => {
  if (!u.isTgl) return placeBackward(stages[u.idx[0]], end, env);
  setTglWindow(stages, u, env.ctx.subtractWorkingDays(end, HARI_KERJA_TAHAPAN_TGL), end);
  return true;
};

/**
 * R1: slot tahapan (per jam) yang memakai mesin yang sudah terpakai di jadwal_produksi.
 * Mesin allow_concurrent tidak dicek. env = { occ, meta }.
 */
const findMesinConflicts = (env, stages) => {
  const conflicts = [];
  const last = stages.length - 1;
  stages.forEach((s, i) => {
    if (i === last || s.isTgl || env.meta.allowConcurrent(s)) return;
    for (const slot of s.slots) {
      const o = env.occ.get(slot, s);
      if (o) {
        conflicts.push({
          rule: "R1",
          id_tahapan: s.id,
          tahapan: s.tahapan,
          mesin: s.mesin,
          waktu: fmtDateTime(slot),
          no_jo: o.no_jo,
          no_booking: o.no_booking,
          tahapan_lain: o.tahapan,
          msg: `Mesin ${s.mesin} sudah dipakai ${o.no_jo || o.no_booking} (${o.tahapan}) pada ${fmtDateTime(slot)}`,
        });
      }
    }
  });
  return conflicts;
};

/**
 * Hitung jadwal (fungsi murni). Tahapan terakhir = FG.
 * Setiap unit u: selesai(u) + drying(u) <= mulai(u+1).
 * Jam mesin yang sudah terpakai TIDAK dilompati: jadwal ditaruh di posisi
 * idealnya dan bentroknya dilaporkan di `conflicts` (R1) supaya PPIC yang
 * memutuskan (geser manual / cari jam kosong / selesaikan semua bentrok).
 */
const computeCalculate = ({ tiket, stages, ctx, occ, meta }) => {
  const tglKirim = parseTglKirim(tiket);
  if (!tglKirim) throw httpError(400, "tanggal kirim tidak valid");

  const targetFG = ctx.subtractWorkingDays(tglKirim, SPARE_HARI_KERJA);
  const last = stages.length - 1;
  stages.forEach((s) => computeDuration(s, tiket));

  const fg = stages[last];
  fg.slots = [];
  fg.mulai = targetFG;
  fg.selesai = targetFG;
  fg.drying_mulai = targetFG;
  fg.drying_selesai = targetFG;

  const env = { ctx, occ, meta, skipOccupied: false };
  const units = buildUnits(stages);
  let nextStart = targetFG;
  for (let x = units.length - 1; x >= 0; x--) {
    const u = units[x];
    const end = addHours(nextStart, -unitMaxDrying(stages, u));
    if (!placeUnitBackward(stages, u, end, env)) {
      const s = stages[u.idx[0]];
      throw httpError(
        400,
        `Tidak ditemukan jam kerja kosong untuk tahapan ${s.tahapan} (mesin ${s.mesin})`
      );
    }
    nextStart = unitMulai(stages, u);
  }

  const conflicts = occ && meta ? findMesinConflicts({ occ, meta }, stages) : [];
  return { tglKirim, targetFG, stages, units, conflicts };
};

// baris tiket_jadwal_produksi_per_jam untuk slot sebuah tahapan
const buildSlotRows = (tiket, stage, ctx) =>
  stage.slots.map((slot) => ({
    id_tiket_jadwal_produksi: tiket.id,
    id_tiket_jadwal_produksi_tahapan: stage.id,
    item: tiket.item,
    no_jo: tiket.no_jo,
    no_booking: tiket.no_booking,
    qty_pcs: tiket.qty_pcs,
    qty_druk: tiket.qty_druk,
    tahapan: stage.tahapan,
    tahapan_ke: stage.tahapan_ke,
    from: stage.from,
    nama_kategori: stage.nama_kategori,
    kategori: stage.kategori,
    kategori_drying_time: stage.kategori_drying_time,
    mesin: stage.mesin,
    kapasitas_per_jam: stage.kapasitas_per_jam,
    drying_time: stage.drying_time,
    setting: stage.setting,
    kapasitas: stage.kapasitas,
    toleransi: stage.toleransi,
    total_waktu: stage.total_waktu,
    // total_waktu_produksi & tgl hanya untuk response (bukan kolom tabel)
    total_waktu_produksi: stage.total_waktu_produksi,
    tgl: fmtDate(slot),
    tanggal: fmtDate(slot),
    jam: fmtTime(slot),
    is_lembur: !!(ctx.isLemburGlobal || ctx.isLemburHour(slot, stage.mesin)),
  }));

// kolom tahapan yang disimpan dari posisi plan
const stagePositionColumns = (stage) => ({
  tgl_from: fmtTglFromTo(stage.mulai),
  tgl_to: fmtTglFromTo(stage.selesai),
  produksi_mulai: stage.mulai,
  produksi_selesai: stage.selesai,
  drying_mulai: stage.drying_mulai,
  drying_selesai: stage.drying_selesai,
});

const stageToResponse = (stage, slotRows) => ({
  id: stage.id,
  id_tiket_jadwal_produksi: stage.id_tiket_jadwal_produksi,
  tahapan: stage.tahapan,
  tahapan_ke: stage.tahapan_ke,
  from: stage.from,
  nama_kategori: stage.nama_kategori,
  kategori: stage.kategori,
  kategori_drying_time: stage.kategori_drying_time,
  id_tahapan: stage.id_tahapan,
  id_mesin: stage.id_mesin,
  mesin: stage.mesin,
  kapasitas_per_jam: stage.kapasitas_per_jam,
  drying_time: stage.drying_time,
  setting: stage.setting,
  kapasitas: stage.kapasitas,
  toleransi: stage.toleransi,
  total_waktu: stage.total_waktu,
  total_waktu_produksi: stage.total_waktu_produksi,
  tgl_from: fmtTglFromTo(stage.mulai),
  tgl_to: fmtTglFromTo(stage.selesai),
  produksi_mulai: fmtDateTime(stage.mulai),
  produksi_selesai: fmtDateTime(stage.selesai),
  drying_mulai: fmtDateTime(stage.drying_mulai),
  drying_selesai: fmtDateTime(stage.drying_selesai),
  listJadwalPerJam: slotRows,
});

const mesinOf = (stages) => ({
  names: stages.map((s) => s.mesin).filter(Boolean),
  ids: stages.map((s) => s.id_mesin).filter(Boolean),
});

/**
 * Calculate + simpan. Dipakai GET /ppic/calculateJadwalProduksi/:id
 * transaction opsional (untuk pengujian); kalau tidak diberikan, buat sendiri.
 */
const calculateTiket = async (id, { isLembur = false, transaction } = {}) => {
  const t = transaction || (await db.transaction());
  try {
    const tiketRow = await TiketJadwalProduksi.findByPk(id, {
      include: [{ model: TiketJadwalProduksiTahapan, as: "tahap" }],
      transaction: t,
    });
    if (!tiketRow) throw httpError(404, "data tidak ditemukan");

    const tiket = toTiket(tiketRow);
    const stages = sortStages(tiketRow.tahap.map(toStage));
    if (stages.length === 0) throw httpError(400, "tiket tidak punya tahapan");

    const belumLengkap = stages.some(
      (s) => s.kapasitas_per_jam === 1 || s.drying_time === 1 || s.setting === 1
    );
    if (belumLengkap) throw httpError(400, "data belum lengkap");

    const tglKirim = parseTglKirim(tiket);
    if (!tglKirim) throw httpError(400, "tanggal kirim tidak valid");

    const rangeFrom = addDays(tglKirim, -180);
    const rangeTo = addDays(tglKirim, 14);
    const { names, ids } = mesinOf(stages);
    const isLemburGlobal = isLembur === true || isLembur === "true";

    const ctx = await loadShiftContext({
      tglMulai: rangeFrom,
      tglSelesai: rangeTo,
      mesinList: names,
      isLemburGlobal,
      transaction: t,
    });
    const occ = await loadOccupancy({
      from: rangeFrom,
      to: tglKirim,
      mesinNames: names,
      mesinIds: ids,
      excludeTiket: tiket,
      transaction: t,
    });
    const meta = await loadMesinMeta({ ids, names, transaction: t });

    const plan = computeCalculate({ tiket, stages, ctx, occ, meta });

    // simpan
    await TiketJadwalProduksiPerJam.destroy({
      where: { id_tiket_jadwal_produksi: tiket.id },
      transaction: t,
    });
    await TiketJadwalProduksi.update(
      {
        status: "calculated",
        tgl_mulai_produksi: fmtDate(plan.stages[0].mulai),
        tgl_target_fg: fmtDate(plan.targetFG),
      },
      { where: { id: tiket.id }, transaction: t }
    );

    const allRows = [];
    const tahapResponse = [];
    for (const s of plan.stages) {
      await TiketJadwalProduksiTahapan.update(
        {
          kapasitas: s.kapasitas,
          total_waktu_produksi: s.total_waktu_produksi,
          total_waktu: s.total_waktu,
          ...stagePositionColumns(s),
          is_diubah_manual: false,
        },
        { where: { id: s.id }, transaction: t }
      );
      const rows = buildSlotRows(tiket, s, ctx);
      if (rows.length) {
        await TiketJadwalProduksiPerJam.bulkCreate(rows, { transaction: t });
      }
      allRows.push(...rows);
      tahapResponse.push(stageToResponse(s, rows));
    }

    if (!transaction) await t.commit();

    return {
      data: {
        id: tiket.id,
        item: tiket.item,
        no_jo: tiket.no_jo,
        no_booking: tiket.no_booking,
        tgl_kirim: tiket.tgl_kirim,
        tgl_cetak: tiket.tgl_cetak,
        tgl_target_fg: fmtDate(plan.targetFG),
        qty_pcs: tiket.qty_pcs,
        qty_druk: tiket.qty_druk,
        status: "calculated",
        tahap: tahapResponse,
        // bentrok mesin dengan jadwal_produksi (R1), diselesaikan oleh PPIC
        conflicts: plan.conflicts,
      },
      jadwalPerJam: allRows,
    };
  } catch (err) {
    if (!transaction) await t.rollback();
    throw err;
  }
};

module.exports = {
  SPARE_HARI_KERJA,
  httpError,
  addDays,
  toTiket,
  toStage,
  sortStages,
  parseTglKirim,
  computeDuration,
  setDrying,
  placeForward,
  placeBackward,
  buildUnits,
  unitStages,
  unitMulai,
  unitDryingSelesai,
  unitMaxDrying,
  setTglWindow,
  placeUnitForward,
  placeUnitBackward,
  findMesinConflicts,
  computeCalculate,
  buildSlotRows,
  stagePositionColumns,
  mesinOf,
  calculateTiket,
};
