// Ubah hasil calculate tiket jadwal produksi: geser jadwal / ubah kapasitas / ubah drying.
// Lihat docs/plan-edit-jadwal-produksi.md bagian 4 & 6.
const { QueryTypes } = require("sequelize");
const db = require("../../../../config/database");
const TiketJadwalProduksi = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiModel");
const TiketJadwalProduksiTahapan = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiTahapanModel");
const TiketJadwalProduksiPerJam = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiPerJamModel");
const TiketJadwalProduksiAdjustLog = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiAdjustLogModel");
const { loadShiftContext } = require("./jadwalShiftHelper");
const { loadOccupancy, loadMesinMeta } = require("./jadwalOccupancyHelper");
const {
  addHours,
  floorHour,
  ceilHour,
  maxDate,
  fmtDate,
  fmtDateTime,
  fmtTanggalIndo,
  fmtWaktuIndo,
  parseLocalDateTime,
} = require("./jadwalLayoutHelper");
const {
  SPARE_HARI_KERJA,
  httpError,
  addDays,
  toTiket,
  toStage,
  sortStages,
  parseTglKirim,
  computeDuration,
  buildUnits,
  unitStages,
  unitMulai,
  unitDryingSelesai,
  unitMaxDrying,
  placeUnitForward,
  placeUnitBackward,
  findMesinConflicts,
  buildSlotRows,
  stagePositionColumns,
  mesinOf,
} = require("./jadwalCalculateService");

const JENIS = ["geser", "ubah_parameter"];
const MODE = ["mulai_tetap", "selesai_tetap"];
const MAX_AVAILABILITY_DAYS = 31;
const MAX_SUGGEST_DAYS = 45;

const sameTime = (a, b) =>
  (!a && !b) || (!!a && !!b && a.getTime() === b.getTime());

const cloneStage = (s) => ({ ...s, slots: [...s.slots] });

const posisi = (s) => ({
  mulai: fmtDateTime(s.mulai),
  selesai: fmtDateTime(s.selesai),
  drying_mulai: fmtDateTime(s.drying_mulai),
  drying_selesai: fmtDateTime(s.drying_selesai),
});

// pendamping label tampilan ("06 Desember 2026 08:00") untuk response.
// tidak dipakai di adjust log / DB (nilaiLog tetap pakai posisi saja)
const posisiLabel = (s) => ({
  mulai_label: fmtWaktuIndo(s.mulai),
  selesai_label: fmtWaktuIndo(s.selesai),
  drying_mulai_label: fmtWaktuIndo(s.drying_mulai),
  drying_selesai_label: fmtWaktuIndo(s.drying_selesai),
});

// tgl_kirim & tgl_target_fg + label
const tglInfo = (tglKirim, targetFG) => ({
  tgl_kirim: fmtDate(tglKirim),
  tgl_kirim_label: fmtTanggalIndo(tglKirim),
  tgl_target_fg: fmtDate(targetFG),
  tgl_target_fg_label: fmtTanggalIndo(targetFG),
});

const samePosition = (a, b) =>
  sameTime(a.mulai, b.mulai) &&
  sameTime(a.selesai, b.selesai) &&
  sameTime(a.drying_selesai, b.drying_selesai) &&
  a.slots.length === b.slots.length &&
  a.slots.every((t, i) => t.getTime() === b.slots[i].getTime());

/* ------------------------------------------------------------------ */
/* Load konteks dari database                                          */
/* ------------------------------------------------------------------ */

/**
 * Load tiket + posisi jadwal sekarang + aturan jam kerja + jam mesin terpakai.
 * lock = true -> kunci baris tiket & slot mesin terkait (dipakai saat apply).
 */
const loadAdjustContext = async (idTahapan, options = {}) => {
  const tahapRow = await TiketJadwalProduksiTahapan.findByPk(idTahapan, {
    attributes: ["id", "id_tiket_jadwal_produksi"],
    transaction: options.transaction,
  });
  if (!tahapRow) throw httpError(404, "tahapan tidak ditemukan");
  return loadAdjustContextByTiket(tahapRow.id_tiket_jadwal_produksi, options);
};

const loadAdjustContextByTiket = async (
  idTiket,
  { isLembur = false, transaction, lock = false } = {}
) => {
  if (lock) {
    await TiketJadwalProduksi.findByPk(idTiket, {
      attributes: ["id"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
  }

  const tiketRow = await TiketJadwalProduksi.findByPk(idTiket, {
    include: [{ model: TiketJadwalProduksiTahapan, as: "tahap" }],
    transaction,
  });
  if (!tiketRow) throw httpError(404, "tiket tidak ditemukan");

  const tiket = toTiket(tiketRow);
  if (tiket.status !== "calculated" || tiket.status_tiket !== "incoming") {
    throw httpError(
      400,
      "Jadwal hanya bisa diubah untuk tiket yang sudah di-calculate dan belum di-submit"
    );
  }

  const tglKirim = parseTglKirim(tiket);
  if (!tglKirim) throw httpError(400, "tanggal kirim tidak valid");

  const rawById = new Map(tiketRow.tahap.map((r) => [r.id, r]));
  const stages = sortStages(tiketRow.tahap.map(toStage));
  const last = stages.length - 1;

  const slotRows = await db.query(
    `SELECT id_tiket_jadwal_produksi_tahapan AS id_tahap,
            DATE_FORMAT(tanggal, '%Y-%m-%d') AS tgl, TIME_FORMAT(jam, '%H:%i') AS jam
       FROM tiket_jadwal_produksi_per_jam
      WHERE id_tiket_jadwal_produksi = :id
      ORDER BY tanggal, jam`,
    { replacements: { id: tiket.id }, type: QueryTypes.SELECT, transaction }
  );
  const slotsByStage = new Map();
  for (const r of slotRows) {
    if (!slotsByStage.has(r.id_tahap)) slotsByStage.set(r.id_tahap, []);
    slotsByStage.get(r.id_tahap).push(parseLocalDateTime(`${r.tgl} ${r.jam}`));
  }

  stages.forEach((s, i) => {
    const raw = rawById.get(s.id);
    if (!raw.produksi_mulai || !raw.produksi_selesai) {
      throw httpError(
        409,
        "Tiket ini di-calculate dengan versi lama. Calculate ulang tiket terlebih dahulu."
      );
    }
    s.slots = s.isTgl || i === last ? [] : slotsByStage.get(s.id) || [];
    s.durasi = s.isTgl ? 0 : s.slots.length;
    // tahapan per jam: posisi diambil dari slot (sumber kebenaran);
    // tahapan tgl & FG: dari kolom produksi_mulai / produksi_selesai
    if (s.slots.length) {
      s.mulai = s.slots[0];
      s.selesai = addHours(s.slots[s.slots.length - 1], 1);
    } else {
      s.mulai = new Date(raw.produksi_mulai);
      s.selesai = new Date(raw.produksi_selesai);
    }
    // drying selalu dihitung dari selesai produksi
    s.drying_mulai = s.selesai;
    s.drying_selesai = addHours(s.selesai, s.drying_time || 0);
  });

  const now = new Date();
  const earliest = stages.reduce(
    (min, s) => (s.mulai < min ? s.mulai : min),
    now
  );
  const rangeFrom = addDays(earliest, -30);
  const rangeTo = addDays(tglKirim, 14);
  const { names, ids } = mesinOf(stages);
  const isLemburGlobal = isLembur === true || isLembur === "true";

  const ctx = await loadShiftContext({
    tglMulai: rangeFrom,
    tglSelesai: rangeTo,
    mesinList: names,
    isLemburGlobal,
    transaction,
  });
  const targetFG = tiket.tgl_target_fg
    ? parseLocalDateTime(String(tiket.tgl_target_fg).slice(0, 10))
    : ctx.subtractWorkingDays(tglKirim, SPARE_HARI_KERJA);

  const occ = await loadOccupancy({
    from: rangeFrom,
    to: rangeTo,
    mesinNames: names,
    mesinIds: ids,
    excludeTiket: tiket,
    lock,
    transaction,
  });
  const meta = await loadMesinMeta({ ids, names, transaction });

  return { tiket, stages, ctx, occ, meta, tglKirim, targetFG, now };
};

/* ------------------------------------------------------------------ */
/* Simulasi (fungsi murni terhadap konteks)                            */
/* ------------------------------------------------------------------ */

const validateBody = (body, stage) => {
  if (!JENIS.includes(body.jenis)) {
    throw httpError(400, `jenis harus salah satu dari: ${JENIS.join(", ")}`);
  }
  if (body.ikut !== undefined && body.ikut !== null && !Array.isArray(body.ikut)) {
    throw httpError(400, "ikut harus berupa array id tahapan");
  }
  if (body.jenis === "geser") {
    if (!parseLocalDateTime(body.new_start)) {
      throw httpError(400, "new_start wajib diisi, format YYYY-MM-DD HH:mm");
    }
    return;
  }
  const adaKapasitas =
    body.kapasitas_per_jam !== undefined && body.kapasitas_per_jam !== null;
  const adaDrying = body.drying_time !== undefined && body.drying_time !== null;
  if (!adaKapasitas && !adaDrying) {
    throw httpError(400, "isi kapasitas_per_jam dan/atau drying_time");
  }
  if (adaKapasitas) {
    if (stage.isTgl) {
      throw httpError(400, `tahapan ${stage.tahapan} tidak memakai kapasitas per jam`);
    }
    const v = Number(body.kapasitas_per_jam);
    if (!Number.isFinite(v) || v <= 0) {
      throw httpError(400, "kapasitas_per_jam harus angka lebih dari 0");
    }
  }
  if (adaDrying) {
    const v = Number(body.drying_time);
    if (!Number.isInteger(v) || v < 0) {
      throw httpError(400, "drying_time harus bilangan bulat jam, minimal 0");
    }
  }
  if (body.mode !== undefined && !MODE.includes(body.mode)) {
    throw httpError(400, `mode harus salah satu dari: ${MODE.join(", ")}`);
  }
};

const unitLabelOf = (stages, u) =>
  unitStages(stages, u).map((s) => s.tahapan).join(" + ");

/**
 * Evaluasi akhir sebuah plan terhadap posisi awal:
 * FG mengikuti tahapan terakhir, R4 (tanggal kirim), R6 (spare),
 * R5 (masa lalu), R7 (lembur), R8 (draft) untuk tahapan yang berubah.
 * Mengubah posisi FG dan info[last].peran.
 */
const evaluatePlan = (C, orig, stages, units, info) => {
  const { ctx, occ, tglKirim, targetFG, now } = C;
  const last = stages.length - 1;
  const nowHour = ceilHour(now);
  const conflicts = [];
  const warnings = [];

  const fg = stages[last];
  if (units.length > 0) {
    const lastUnit = units[units.length - 1];
    const lastStage = stages[lastUnit.idx[lastUnit.idx.length - 1]];
    const akhir = unitDryingSelesai(stages, lastUnit);
    const fgBaru = maxDate(targetFG, akhir);
    fg.mulai = fgBaru;
    fg.selesai = fgBaru;
    fg.drying_mulai = fgBaru;
    fg.drying_selesai = fgBaru;
    if (akhir.getTime() > tglKirim.getTime()) {
      conflicts.push({
        rule: "R4",
        id_tahapan: lastStage.id,
        tahapan: lastStage.tahapan,
        msg: `${unitLabelOf(stages, lastUnit)} selesai ${fmtWaktuIndo(akhir)}, melewati tanggal kirim ${fmtTanggalIndo(tglKirim)}`,
      });
    } else if (akhir.getTime() > targetFG.getTime()) {
      warnings.push({
        rule: "R6",
        msg: `Memakai spare: selesai ${fmtWaktuIndo(akhir)}, melewati target FG ${fmtTanggalIndo(targetFG)}`,
        spare_terpakai_jam: Math.round((akhir - targetFG) / 3600000),
      });
    }
  }
  if (!samePosition(fg, orig[last])) info[last].peran = "ikut";

  stages.forEach((s, i) => {
    if (info[i].peran === "tetap" || i === last) return;
    if (s.mulai.getTime() < nowHour.getTime()) {
      conflicts.push({
        rule: "R5",
        id_tahapan: s.id,
        tahapan: s.tahapan,
        msg: `${s.tahapan} mulai ${fmtWaktuIndo(s.mulai)}, sebelum waktu sekarang`,
      });
    }
    const lembur = s.slots.filter((t) => ctx.isLemburHour(t, s.mesin));
    if (lembur.length) {
      warnings.push({
        rule: "R7",
        id_tahapan: s.id,
        tahapan: s.tahapan,
        waktu: lembur.map(fmtDateTime),
        waktu_label: lembur.map(fmtWaktuIndo),
        msg: `${s.tahapan}: ${lembur.length} jam jatuh di jam lembur`,
      });
    }
    const draft = [];
    for (const t of s.slots) {
      const o = occ.getDraft(t, s);
      if (o)
        draft.push({
          waktu: fmtDateTime(t),
          waktu_label: fmtWaktuIndo(t),
          no_jo: o.no_jo,
          no_booking: o.no_booking,
        });
    }
    if (draft.length) {
      warnings.push({
        rule: "R8",
        id_tahapan: s.id,
        tahapan: s.tahapan,
        detail: draft,
        msg: `${s.tahapan}: ${draft.length} jam bentrok dengan tiket lain yang belum di-submit`,
      });
    }
  });

  return { conflicts, warnings };
};

// baris "tahapan" untuk response simulasi / penyelesaian bentrok
const buildTahapanRows = (orig, stages, units, info) => {
  const last = stages.length - 1;
  const unitOf = new Map();
  units.forEach((u, x) => u.idx.forEach((i) => unitOf.set(i, x)));
  return stages.map((s, i) => {
    const changed = info[i].peran !== "tetap";
    const u = unitOf.has(i) ? units[unitOf.get(i)] : null;
    return {
      id: s.id,
      tahapan: s.tahapan,
      tahapan_ke: s.tahapan_ke,
      mesin: s.mesin,
      id_mesin: s.id_mesin,
      from: s.from,
      is_fg: i === last,
      // tahapan tgl berurutan berbagi jendela & bergeser bersama
      grup_tgl: u && u.idx.length > 1 ? unitOf.get(i) : null,
      ...info[i],
      lama: { ...posisi(orig[i]), ...posisiLabel(orig[i]) },
      baru: { ...posisi(s), ...posisiLabel(s) },
      geser_jam: Math.round((s.mulai - orig[i].mulai) / 3600000),
      slots_baru: changed && i !== last ? s.slots.map(fmtDateTime) : undefined,
      slots_baru_label:
        changed && i !== last ? s.slots.map(fmtWaktuIndo) : undefined,
    };
  });
};



/**
 * Simulasi perubahan pada tahapan idTahapan. Tidak menyimpan apa pun.
 * Return { result (untuk response), stages (posisi baru), orig, k, peran }
 */
const simulateInternal = (C, idTahapan, body) => {
  const { tiket, ctx, occ, meta, tglKirim, targetFG, now } = C;
  const orig = C.stages;
  const stages = orig.map(cloneStage);
  const last = stages.length - 1;
  const units = buildUnits(stages);
  const unitOf = new Map();
  units.forEach((u, x) => u.idx.forEach((i) => unitOf.set(i, x)));

  const k = stages.findIndex((s) => Number(s.id) === Number(idTahapan));
  if (k < 0) throw httpError(404, "tahapan tidak ditemukan di tiket ini");
  if (k === last) throw httpError(400, "Tahapan FG tidak bisa diubah langsung");

  const target = stages[k];
  validateBody(body, target);

  const ku = unitOf.get(k);
  const unitK = units[ku];
  const conflicts = [];
  const warnings = [];
  const ikutSet = Array.isArray(body.ikut)
    ? new Set(body.ikut.map(Number))
    : null;

  const info = stages.map(() => ({
    peran: "tetap",
    wajib_ikut: false,
    dicentang: false,
    bisa_dicentang: false,
  }));
  const setUnitInfo = (u, values) =>
    u.idx.forEach((i) => Object.assign(info[i], values));
  // anggota grup tgl lain ikut bergeser bersama tahapan yang diubah
  setUnitInfo(unitK, { peran: "ikut", wajib_ikut: true, dicentang: true });
  info[k] = { peran: "diubah", wajib_ikut: false, dicentang: false, bisa_dicentang: false };

  const env = { ctx, occ, meta, skipOccupied: true };
  let parameter = null;

  // ---- 1. susun ulang unit tahapan yang diubah ----
  if (body.jenis === "geser") {
    const newStart = parseLocalDateTime(body.new_start);
    if (!placeUnitForward(stages, unitK, newStart, { ...env, skipOccupied: false })) {
      conflicts.push({
        rule: "R1",
        id_tahapan: target.id,
        tahapan: target.tahapan,
        msg: `Tidak ditemukan jam kerja untuk ${target.tahapan}`,
      });
    } else if (!unitK.isTgl && !meta.allowConcurrent(target)) {
      for (const slot of target.slots) {
        const o = occ.get(slot, target);
        if (o) {
          conflicts.push({
            rule: "R1",
            id_tahapan: target.id,
            tahapan: target.tahapan,
            mesin: target.mesin,
            waktu: fmtDateTime(slot),
            waktu_label: fmtWaktuIndo(slot),
            no_jo: o.no_jo,
            no_booking: o.no_booking,
            tahapan_lain: o.tahapan,
            msg: `Mesin ${target.mesin} sudah dipakai ${o.no_jo || o.no_booking} (${o.tahapan}) pada ${fmtWaktuIndo(slot)}`,
          });
        }
      }
    }
  } else {
    const before = orig[k];
    const mode = body.mode || "mulai_tetap";
    parameter = {
      mode,
      kapasitas_per_jam: { lama: before.kapasitas_per_jam, baru: before.kapasitas_per_jam },
      drying_time: { lama: before.drying_time, baru: before.drying_time },
      durasi_jam: { lama: before.durasi, baru: before.durasi },
    };
    if (body.kapasitas_per_jam !== undefined && body.kapasitas_per_jam !== null) {
      target.kapasitas_per_jam = Number(body.kapasitas_per_jam);
    }
    if (body.drying_time !== undefined && body.drying_time !== null) {
      target.drying_time = Number(body.drying_time);
    }
    computeDuration(target, tiket);
    parameter.kapasitas_per_jam.baru = target.kapasitas_per_jam;
    parameter.drying_time.baru = target.drying_time;
    parameter.durasi_jam.baru = target.durasi;

    let ok;
    if (mode === "mulai_tetap") {
      if (unitK.isTgl) {
        // jendela grup tidak berubah, hanya drying
        target.drying_mulai = target.selesai;
        target.drying_selesai = addHours(target.selesai, target.drying_time);
        ok = true;
      } else {
        ok = placeUnitForward(stages, unitK, before.mulai, env);
      }
    } else {
      // jam selesai + drying unit tetap
      ok = placeUnitBackward(
        stages,
        unitK,
        addHours(unitDryingSelesai(orig, unitK), -unitMaxDrying(stages, unitK)),
        env
      );
    }
    if (!ok) {
      conflicts.push({
        rule: "R1",
        id_tahapan: target.id,
        tahapan: target.tahapan,
        msg: `Tidak ditemukan jam kerja kosong untuk ${target.tahapan}`,
      });
    }
  }

  const unitLabel = (u) => unitStages(stages, u).map((s) => s.tahapan).join(" + ");
  const unitIkut = (u) => unitStages(stages, u).some((s) => ikutSet.has(Number(s.id)));

  // ---- 2. unit sesudah: dirapatkan maju ----
  if (conflicts.length === 0) {
    for (let x = ku + 1; x < units.length; x++) {
      const u = units[x];
      const batas = unitDryingSelesai(stages, units[x - 1]);
      const wajib = unitMulai(stages, u).getTime() < batas.getTime();
      const dicentang = ikutSet ? unitIkut(u) : wajib;
      setUnitInfo(u, { wajib_ikut: wajib, dicentang, bisa_dicentang: true });
      if (wajib && !dicentang) {
        const s = stages[u.idx[0]];
        conflicts.push({
          rule: "R3",
          id_tahapan: s.id,
          tahapan: s.tahapan,
          msg: `${unitLabel(u)} wajib ikut bergeser (tumpang tindih dengan ${unitLabel(units[x - 1])} + drying), tapi tidak dicentang`,
        });
        break;
      }
      if (!dicentang) break;
      if (!placeUnitForward(stages, u, batas, env)) {
        conflicts.push({
          rule: "R1",
          id_tahapan: stages[u.idx[0]].id,
          tahapan: stages[u.idx[0]].tahapan,
          msg: `Tidak ditemukan jam kerja kosong untuk ${unitLabel(u)}`,
        });
        break;
      }
      setUnitInfo(u, { peran: "ikut" });
    }
  }

  // ---- 3. unit sebelum: dirapatkan mundur ----
  if (conflicts.length === 0) {
    for (let x = ku - 1; x >= 0; x--) {
      const u = units[x];
      const nextMulai = unitMulai(stages, units[x + 1]);
      const wajib = unitDryingSelesai(stages, u).getTime() > nextMulai.getTime();
      const dicentang = ikutSet ? unitIkut(u) : wajib;
      setUnitInfo(u, { wajib_ikut: wajib, dicentang, bisa_dicentang: true });
      if (wajib && !dicentang) {
        const s = stages[u.idx[0]];
        conflicts.push({
          rule: "R2",
          id_tahapan: s.id,
          tahapan: s.tahapan,
          msg: `${unitLabel(u)} wajib ikut bergeser (selesai + drying melewati mulai ${unitLabel(units[x + 1])}), tapi tidak dicentang`,
        });
        break;
      }
      if (!dicentang) break;
      const batas = addHours(nextMulai, -unitMaxDrying(stages, u));
      if (!placeUnitBackward(stages, u, batas, env)) {
        conflicts.push({
          rule: "R1",
          id_tahapan: stages[u.idx[0]].id,
          tahapan: stages[u.idx[0]].tahapan,
          msg: `Tidak ditemukan jam kerja kosong untuk ${unitLabel(u)}`,
        });
        break;
      }
      setUnitInfo(u, { peran: "ikut" });
    }
  }

  // ---- 4. FG, tanggal kirim, spare, masa lalu, lembur, draft ----
  const evaluated = evaluatePlan(C, orig, stages, units, info);
  conflicts.push(...evaluated.conflicts);
  warnings.push(...evaluated.warnings);

  const result = {
    valid: conflicts.length === 0,
    jenis: body.jenis,
    id_tahapan: target.id,
    ...tglInfo(tglKirim, targetFG),
    parameter,
    tahapan: buildTahapanRows(orig, stages, units, info),
    conflicts,
    warnings,
  };

  return { result, stages, orig, k, info, parameter, units };
};

const simulate = async (idTahapan, body, { transaction } = {}) => {
  const C = await loadAdjustContext(idTahapan, {
    isLembur: body.is_lembur,
    transaction,
  });
  return simulateInternal(C, idTahapan, body).result;
};

/* ------------------------------------------------------------------ */
/* Availability & suggest slot                                         */
/* ------------------------------------------------------------------ */

const otherStagesChanged = (r) =>
  r.result.tahapan.some((t) => t.peran === "ikut" && !t.is_fg);

const availability = async (idTahapan, query = {}, { transaction } = {}) => {
  const C = await loadAdjustContext(idTahapan, {
    isLembur: query.is_lembur,
    transaction,
  });
  return availabilityFromContext(C, idTahapan, query);
};

const availabilityFromContext = (C, idTahapan, query = {}) => {
  const stage = C.stages.find((s) => Number(s.id) === Number(idTahapan));
  if (!stage) throw httpError(404, "tahapan tidak ditemukan");
  if (stage === C.stages[C.stages.length - 1]) {
    throw httpError(400, "Tahapan FG tidak bisa diubah langsung");
  }

  let from = parseLocalDateTime(query.from) || floorHour(C.now);
  let to = parseLocalDateTime(query.to) || C.tglKirim;
  from = floorHour(from);
  const maxTo = addDays(from, MAX_AVAILABILITY_DAYS);
  if (to > maxTo) to = maxTo;
  if (to < from) throw httpError(400, "rentang from/to tidak valid");

  // slot milik tiket ini di mesin yang sama
  const sameMesin = (s) =>
    (stage.id_mesin && s.id_mesin && Number(stage.id_mesin) === Number(s.id_mesin)) ||
    (s.mesin || "").toLowerCase() === (stage.mesin || "").toLowerCase();
  const own = new Set();
  C.stages.filter(sameMesin).forEach((s) => s.slots.forEach((t) => own.add(t.getTime())));

  const slots = [];
  for (let t = new Date(from); t < to; t = addHours(t, 1)) {
    const working = C.ctx.isWorkingHour(t, stage.mesin);
    const o = C.occ.get(t, stage);
    const d = C.occ.getDraft(t, stage);
    let status;
    if (own.has(t.getTime())) status = "milik_tiket_ini";
    else if (o) status = "terisi";
    else if (d) status = "terisi_draft";
    else if (!working) status = "di_luar_shift";
    else if (C.ctx.isLemburHour(t, stage.mesin)) status = "lembur";
    else status = "kosong";

    let zona = null;
    if (working) {
      const r = simulateInternal(C, idTahapan, {
        jenis: "geser",
        new_start: fmtDateTime(t),
      });
      zona = !r.result.valid ? "merah" : otherStagesChanged(r) ? "kuning" : "hijau";
    }

    const item = {
      waktu: fmtDateTime(t),
      waktu_label: fmtWaktuIndo(t),
      status,
      zona,
    };
    if (o) {
      item.no_jo = o.no_jo;
      item.no_booking = o.no_booking;
      item.tahapan = o.tahapan;
    } else if (d) {
      item.no_jo = d.no_jo;
      item.no_booking = d.no_booking;
      item.tahapan = d.tahapan;
    }
    slots.push(item);
  }

  const orig = C.stages.find((s) => Number(s.id) === Number(idTahapan));
  return {
    tahapan: {
      id: orig.id,
      tahapan: orig.tahapan,
      mesin: orig.mesin,
      id_mesin: orig.id_mesin,
      from: orig.from,
      allow_concurrent: C.meta.allowConcurrent(orig),
      durasi_jam: orig.durasi,
      drying_time: orig.drying_time,
      ...posisi(orig),
      ...posisiLabel(orig),
    },
    ...tglInfo(C.tglKirim, C.targetFG),
    from: fmtDateTime(from),
    from_label: fmtWaktuIndo(from),
    to: fmtDateTime(to),
    to_label: fmtWaktuIndo(to),
    slots,
  };
};

const suggestSlot = async (idTahapan, body = {}, { transaction } = {}) => {
  const C = await loadAdjustContext(idTahapan, {
    isLembur: body.is_lembur,
    transaction,
  });
  return suggestFromContext(C, idTahapan, body);
};

/**
 * Cari jam mulai valid terdekat dari `around` (arah lebih cepat didahulukan),
 * antara waktu sekarang dan tanggal kirim. Return { new_start, sim } atau null.
 */
const suggestInternal = (C, idTahapan, body = {}) => {
  const stage = C.stages.find((s) => Number(s.id) === Number(idTahapan));
  if (!stage) throw httpError(404, "tahapan tidak ditemukan");
  if (stage === C.stages[C.stages.length - 1]) {
    throw httpError(400, "Tahapan FG tidak bisa diubah langsung");
  }

  const around = floorHour(parseLocalDateTime(body.around) || stage.mulai);
  const lower = ceilHour(C.now);
  const upper = C.tglKirim;
  const maxStep = MAX_SUGGEST_DAYS * 24;

  const tryAt = (t) => {
    if (t < lower || t > upper) return null;
    if (!stage.isTgl && !C.ctx.isWorkingHour(t, stage.mesin)) return null;
    const sim = simulateInternal(C, idTahapan, {
      jenis: "geser",
      new_start: fmtDateTime(t),
    });
    if (!sim.result.valid) return null;
    return { new_start: fmtDateTime(sim.stages[sim.k].mulai), sim };
  };

  for (let d = 0; d <= maxStep; d++) {
    const earlier = tryAt(addHours(around, -d));
    if (earlier) return earlier;
    if (d > 0) {
      const later = tryAt(addHours(around, d));
      if (later) return later;
    }
  }
  return null;
};

const suggestFromContext = (C, idTahapan, body = {}) => {
  const found = suggestInternal(C, idTahapan, body);
  if (!found) {
    throw httpError(404, "Tidak ditemukan jam mulai yang valid sampai tanggal kirim");
  }
  return {
    new_start: found.new_start,
    new_start_label: fmtWaktuIndo(parseLocalDateTime(found.new_start)),
    ...found.sim.result,
  };
};

/* ------------------------------------------------------------------ */
/* Bentrok mesin & selesaikan semua bentrok                            */
/* ------------------------------------------------------------------ */

const conflictSummary = (conflicts) => {
  const byStage = new Map();
  for (const c of conflicts) {
    if (!byStage.has(c.id_tahapan)) {
      byStage.set(c.id_tahapan, {
        id_tahapan: c.id_tahapan,
        tahapan: c.tahapan,
        mesin: c.mesin,
        jumlah_jam: 0,
        no_jo: [],
      });
    }
    const s = byStage.get(c.id_tahapan);
    s.jumlah_jam++;
    const jo = c.no_jo || c.no_booking;
    if (jo && !s.no_jo.includes(jo)) s.no_jo.push(jo);
  }
  return [...byStage.values()];
};

// bentrok mesin (R1) jadwal tiket sekarang
const getConflicts = async (idTiket, { transaction } = {}) => {
  const C = await loadAdjustContextByTiket(idTiket, { transaction });
  const conflicts = findMesinConflicts(C, C.stages);
  return {
    id_tiket_jadwal_produksi: C.tiket.id,
    ada_bentrok: conflicts.length > 0,
    per_tahapan: conflictSummary(conflicts),
    conflicts,
  };
};

/**
 * Selesaikan semua bentrok mesin secara otomatis (fungsi murni terhadap konteks).
 * Tahapan yang bentrok diproses dari yang paling dekat ke FG, masing-masing
 * dipindah ke jam valid terdekat (sama seperti suggestSlot). Tahapan yang wajib
 * ikut bergeser ikut dirapatkan. Tidak menyimpan apa pun.
 */
const resolveFromContext = (C) => {
  const orig = C.stages;
  const last = orig.length - 1;
  const units = buildUnits(orig);
  let current = orig;
  const diubah = new Set();
  const diselesaikan = [];

  const awal = findMesinConflicts(C, orig);

  // 2 putaran: putaran kedua menangkap bentrok yang muncul karena pergeseran
  for (let pass = 0; pass < 2; pass++) {
    let adaPerubahan = false;
    for (let x = units.length - 1; x >= 0; x--) {
      const u = units[x];
      if (u.isTgl) continue;
      const i = u.idx[0];
      const Cx = { ...C, stages: current };
      const bentrok = findMesinConflicts(Cx, current).filter(
        (c) => Number(c.id_tahapan) === Number(current[i].id)
      );
      if (bentrok.length === 0) continue;
      const found = suggestInternal(Cx, current[i].id, {
        around: fmtDateTime(current[i].mulai),
      });
      if (!found) continue;
      current = found.sim.stages;
      diubah.add(i);
      adaPerubahan = true;
    }
    if (!adaPerubahan) break;
  }

  const sisa = findMesinConflicts({ ...C, stages: current }, current);
  const info = current.map((s, i) => ({
    peran: diubah.has(i)
      ? "diubah"
      : samePosition(s, orig[i])
        ? "tetap"
        : "ikut",
    wajib_ikut: false,
    dicentang: false,
    bisa_dicentang: false,
  }));
  const evaluated = evaluatePlan(C, orig, current, units, info);

  current.forEach((s, i) => {
    if (!diubah.has(i)) return;
    diselesaikan.push({
      id_tahapan: s.id,
      tahapan: s.tahapan,
      mesin: s.mesin,
      dari: fmtDateTime(orig[i].mulai),
      dari_label: fmtWaktuIndo(orig[i].mulai),
      ke: fmtDateTime(s.mulai),
      ke_label: fmtWaktuIndo(s.mulai),
      geser_jam: Math.round((s.mulai - orig[i].mulai) / 3600000),
    });
  });

  const result = {
    // semua bentrok selesai & tidak ada pelanggaran lain
    valid: sisa.length === 0 && evaluated.conflicts.length === 0,
    // boleh disimpan walau sebagian bentrok belum selesai
    bisa_disimpan: diselesaikan.length > 0 && evaluated.conflicts.length === 0,
    ...tglInfo(C.tglKirim, C.targetFG),
    bentrok_awal: conflictSummary(awal),
    diselesaikan,
    belum_terselesaikan: conflictSummary(sisa),
    tahapan: buildTahapanRows(orig, current, units, info),
    conflicts: [...sisa, ...evaluated.conflicts],
    warnings: evaluated.warnings,
  };
  return { result, stages: current, orig, info, last };
};

const resolveConflictsPreview = async (idTiket, body = {}, { transaction } = {}) => {
  const C = await loadAdjustContextByTiket(idTiket, {
    isLembur: body.is_lembur,
    transaction,
  });
  return resolveFromContext(C).result;
};

/* ------------------------------------------------------------------ */
/* Apply (simpan)                                                      */
/* ------------------------------------------------------------------ */

const jenisLog = (body) => {
  if (body.jenis === "geser") return "geser";
  const k = body.kapasitas_per_jam !== undefined && body.kapasitas_per_jam !== null;
  const d = body.drying_time !== undefined && body.drying_time !== null;
  if (k && d) return "ubah_kapasitas_drying";
  return k ? "ubah_kapasitas" : "ubah_drying";
};

const nilaiLog = (s) => ({
  ...posisi(s),
  kapasitas_per_jam: s.kapasitas_per_jam,
  drying_time: s.drying_time,
  durasi_jam: s.durasi,
});

const requireAlasan = (body) => {
  if (!body || !body.alasan || !String(body.alasan).trim()) {
    throw httpError(400, "alasan wajib diisi");
  }
  return String(body.alasan).trim().slice(0, 255);
};

/**
 * Simpan posisi baru semua tahapan yang berubah (peran != tetap).
 * extraColumns(i, stage) -> kolom tambahan untuk tahapan i (opsional).
 */
const writePlan = async (C, stages, info, transaction, extraColumns) => {
  const last = stages.length - 1;
  for (let i = 0; i < stages.length; i++) {
    if (info[i].peran === "tetap") continue;
    const s = stages[i];
    const columns = {
      ...stagePositionColumns(s),
      is_diubah_manual: true,
      ...(extraColumns ? extraColumns(i, s) : {}),
    };
    await TiketJadwalProduksiTahapan.update(columns, {
      where: { id: s.id },
      transaction,
    });
    if (i !== last && !s.isTgl) {
      await TiketJadwalProduksiPerJam.destroy({
        where: { id_tiket_jadwal_produksi_tahapan: s.id },
        transaction,
      });
      const rows = buildSlotRows(C.tiket, s, C.ctx);
      if (rows.length) {
        await TiketJadwalProduksiPerJam.bulkCreate(rows, { transaction });
      }
    }
  }
  if (info[0].peran !== "tetap") {
    await TiketJadwalProduksi.update(
      { tgl_mulai_produksi: fmtDate(stages[0].mulai) },
      { where: { id: C.tiket.id }, transaction }
    );
  }
};

const ikutLog = (orig, stages, info, peranList) =>
  JSON.stringify(
    stages
      .map((s, i) => ({ s, i }))
      .filter(({ i }) => peranList.includes(info[i].peran))
      .map(({ s, i }) => ({
        id: s.id,
        tahapan: s.tahapan,
        peran: info[i].peran,
        lama: posisi(orig[i]),
        baru: posisi(s),
      }))
  );

const apply = async (idTahapan, body, user, { transaction } = {}) => {
  const alasan = requireAlasan(body);
  const t = transaction || (await db.transaction());
  try {
    const C = await loadAdjustContext(idTahapan, {
      isLembur: body.is_lembur,
      transaction: t,
      lock: true,
    });
    const sim = simulateInternal(C, idTahapan, body);
    if (!sim.result.valid) {
      throw httpError(409, { msg: "Perubahan jadwal tidak valid", ...sim.result });
    }

    const { stages, orig, info, k } = sim;
    await writePlan(C, stages, info, t, (i, s) =>
      i === k && body.jenis === "ubah_parameter"
        ? {
            kapasitas_per_jam: s.kapasitas_per_jam,
            drying_time: s.drying_time,
            kapasitas: s.kapasitas,
            total_waktu_produksi: s.total_waktu_produksi,
            total_waktu: s.total_waktu,
          }
        : {}
    );

    await TiketJadwalProduksiAdjustLog.create(
      {
        id_tiket_jadwal_produksi: C.tiket.id,
        id_tiket_jadwal_produksi_tahapan: stages[k].id,
        jenis: jenisLog(body),
        mode: body.jenis === "ubah_parameter" ? body.mode || "mulai_tetap" : null,
        nilai_lama: JSON.stringify(nilaiLog(orig[k])),
        nilai_baru: JSON.stringify(nilaiLog(stages[k])),
        tahapan_ikut: ikutLog(orig, stages, info, ["ikut"]),
        alasan,
        id_user: user && user.id ? user.id : null,
      },
      { transaction: t }
    );

    if (!transaction) await t.commit();
    return sim.result;
  } catch (err) {
    if (!transaction) await t.rollback();
    throw err;
  }
};

/**
 * Simpan hasil "selesaikan semua bentrok". Dihitung ulang di dalam transaction
 * (dengan lock), jadi hasilnya bisa sedikit berbeda dari preview kalau jadwal
 * lain berubah sejak preview.
 */
const resolveConflictsApply = async (idTiket, body, user, { transaction } = {}) => {
  const alasan = requireAlasan(body);
  const t = transaction || (await db.transaction());
  try {
    const C = await loadAdjustContextByTiket(idTiket, {
      isLembur: body.is_lembur,
      transaction: t,
      lock: true,
    });
    const r = resolveFromContext(C);
    if (!r.result.bisa_disimpan) {
      throw httpError(409, {
        msg:
          r.result.diselesaikan.length === 0
            ? "Tidak ada bentrok yang bisa diselesaikan otomatis"
            : "Hasil penyelesaian bentrok tidak valid",
        ...r.result,
      });
    }

    await writePlan(C, r.stages, r.info, t);

    const pertama = r.result.diselesaikan[0];
    await TiketJadwalProduksiAdjustLog.create(
      {
        id_tiket_jadwal_produksi: C.tiket.id,
        id_tiket_jadwal_produksi_tahapan: pertama.id_tahapan,
        jenis: "selesaikan_bentrok",
        mode: null,
        nilai_lama: JSON.stringify({ bentrok: r.result.bentrok_awal }),
        nilai_baru: JSON.stringify({
          diselesaikan: r.result.diselesaikan,
          belum_terselesaikan: r.result.belum_terselesaikan,
        }),
        tahapan_ikut: ikutLog(r.orig, r.stages, r.info, ["diubah", "ikut"]),
        alasan,
        id_user: user && user.id ? user.id : null,
      },
      { transaction: t }
    );

    if (!transaction) await t.commit();
    return r.result;
  } catch (err) {
    if (!transaction) await t.rollback();
    throw err;
  }
};

/* ------------------------------------------------------------------ */
/* Riwayat & cek bentrok saat submit                                   */
/* ------------------------------------------------------------------ */

const getAdjustLog = async (idTiket, { transaction } = {}) => {
  const rows = await TiketJadwalProduksiAdjustLog.findAll({
    where: { id_tiket_jadwal_produksi: idTiket },
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
    transaction,
  });
  const parse = (v) => {
    try {
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  };
  return rows.map((r) => ({
    id: r.id,
    id_tiket_jadwal_produksi: r.id_tiket_jadwal_produksi,
    id_tiket_jadwal_produksi_tahapan: r.id_tiket_jadwal_produksi_tahapan,
    jenis: r.jenis,
    mode: r.mode,
    nilai_lama: parse(r.nilai_lama),
    nilai_baru: parse(r.nilai_baru),
    tahapan_ikut: parse(r.tahapan_ikut) || [],
    alasan: r.alasan,
    id_user: r.id_user,
    createdAt: r.createdAt,
  }));
};

/**
 * Cek R1 untuk semua slot tiket sebelum submit ke jadwal_produksi.
 * stagesWithSlots: [{ id_mesin, mesin, tahapan, slots: [{ tanggal, jam }] }]
 */
const checkSubmitConflicts = async (tiket, stagesWithSlots, { transaction } = {}) => {
  const all = [];
  for (const s of stagesWithSlots) {
    for (const row of s.slots) {
      const tgl =
        row.tanggal instanceof Date ? row.tanggal.toISOString().slice(0, 10) : String(row.tanggal).slice(0, 10);
      const d = parseLocalDateTime(`${tgl} ${String(row.jam).slice(0, 5)}`);
      if (d) all.push({ s, d });
    }
  }
  if (all.length === 0) return [];
  const times = all.map((x) => x.d.getTime());
  const { names, ids } = mesinOf(stagesWithSlots);
  const occ = await loadOccupancy({
    from: new Date(Math.min(...times)),
    to: new Date(Math.max(...times)),
    mesinNames: names,
    mesinIds: ids,
    excludeTiket: tiket,
    lock: true,
    transaction,
  });
  const meta = await loadMesinMeta({ ids, names, transaction });
  const conflicts = [];
  for (const { s, d } of all) {
    if (meta.allowConcurrent(s)) continue;
    const o = occ.get(d, s);
    if (o) {
      conflicts.push({
        rule: "R1",
        tahapan: s.tahapan,
        mesin: s.mesin,
        waktu: fmtDateTime(d),
        waktu_label: fmtWaktuIndo(d),
        no_jo: o.no_jo,
        no_booking: o.no_booking,
        tahapan_lain: o.tahapan,
        msg: `Mesin ${s.mesin} sudah dipakai ${o.no_jo || o.no_booking} (${o.tahapan}) pada ${fmtWaktuIndo(d)}`,
      });
    }
  }
  return conflicts;
};

module.exports = {
  loadAdjustContext,
  simulateInternal,
  simulate,
  availability,
  availabilityFromContext,
  suggestSlot,
  suggestFromContext,
  apply,
  loadAdjustContextByTiket,
  getConflicts,
  resolveFromContext,
  resolveConflictsPreview,
  resolveConflictsApply,
  getAdjustLog,
  checkSubmitConflicts,
};
