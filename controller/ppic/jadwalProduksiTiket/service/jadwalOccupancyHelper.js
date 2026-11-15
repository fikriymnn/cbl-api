// Jam mesin yang sudah terpakai:
// - jadwal_produksi (jadwal resmi / sudah submit)  -> bentrok WAJIB (R1)
// - tiket lain yang sudah calculate tapi belum submit -> peringatan (R8)
const { Op, QueryTypes } = require("sequelize");
const db = require("../../../../config/database");
const MasterMesin = require("../../../../model/masterData/tahapan/masterMesinTahapanModel");
const { fmtDateTime, fmtDate, addHours } = require("./jadwalLayoutHelper");

const norm = (s) => (s || "").toString().trim().toLowerCase();
const slotKeyFromRow = (row) => `${row.tgl} ${String(row.jam).slice(0, 5)}`;

// index baris slot -> pencarian cepat per mesin & jam
const buildIndex = (rows) => {
  const byId = new Map();
  const byNameNoId = new Map(); // data lama yang belum punya id_mesin
  const byNameAll = new Map();
  for (const row of rows) {
    const key = slotKeyFromRow(row);
    const name = norm(row.mesin);
    if (row.id_mesin) {
      byId.set(`${row.id_mesin}|${key}`, row);
    } else if (name) {
      byNameNoId.set(`${name}|${key}`, row);
    }
    if (name) byNameAll.set(`${name}|${key}`, row);
  }
  return { byId, byNameNoId, byNameAll };
};

const lookup = (index, slot, mesin) => {
  const key = fmtDateTime(slot);
  const name = norm(mesin.mesin);
  if (mesin.id_mesin) {
    return (
      index.byId.get(`${mesin.id_mesin}|${key}`) ||
      (name ? index.byNameNoId.get(`${name}|${key}`) : null) ||
      null
    );
  }
  return name ? index.byNameAll.get(`${name}|${key}`) || null : null;
};

/**
 * Buat pengecek occupancy dari baris yang sudah di-load (fungsi murni).
 * rows / draftRows: { id_mesin, mesin, tgl: "YYYY-MM-DD", jam: "HH:mm:ss", no_jo, no_booking, tahapan }
 * excludeTiket: { id, no_jo, no_booking } -> baris milik tiket ini diabaikan
 */
const createOccupancy = ({ rows = [], draftRows = [], excludeTiket = {} }) => {
  const isOwn = (row) =>
    (excludeTiket.id &&
      row.id_tiket_jadwal_produksi &&
      Number(row.id_tiket_jadwal_produksi) === Number(excludeTiket.id)) ||
    (excludeTiket.no_jo && row.no_jo && row.no_jo === excludeTiket.no_jo) ||
    (excludeTiket.no_booking &&
      row.no_booking &&
      row.no_booking === excludeTiket.no_booking);

  const index = buildIndex(rows.filter((r) => !isOwn(r)));
  const draftIndex = buildIndex(draftRows.filter((r) => !isOwn(r)));

  return {
    // { id_mesin, mesin } -> baris jadwal_produksi yang memakai slot ini, atau null
    get: (slot, mesin) => lookup(index, slot, mesin),
    getDraft: (slot, mesin) => lookup(draftIndex, slot, mesin),
  };
};

/**
 * Load jadwal terpakai dari database untuk rentang tanggal & mesin tertentu.
 * lock = true -> SELECT ... FOR UPDATE (dipakai saat apply, di dalam transaction)
 */
const loadOccupancy = async ({
  from,
  to,
  mesinNames = [],
  mesinIds = [],
  excludeTiket = {},
  lock = false,
  transaction,
}) => {
  const names = [...new Set(mesinNames.filter(Boolean))];
  const ids = [...new Set(mesinIds.filter(Boolean).map(Number))];
  if (names.length === 0 && ids.length === 0) {
    return createOccupancy({ excludeTiket });
  }

  const replacements = {
    from: `${fmtDate(from)} 00:00:00`,
    to: `${fmtDate(addHours(to, 24))} 00:00:00`,
    names: names.length ? names : ["__none__"],
    ids: ids.length ? ids : [0],
    idTiket: excludeTiket.id || 0,
  };

  const rows = await db.query(
    `SELECT id_tiket_jadwal_produksi, id_mesin, mesin, no_jo, no_booking, tahapan,
            DATE_FORMAT(tanggal, '%Y-%m-%d') AS tgl, TIME_FORMAT(jam, '%H:%i:%s') AS jam
       FROM jadwal_produksi
      WHERE tanggal >= :from AND tanggal < :to
        AND (mesin IN (:names) OR id_mesin IN (:ids))
      ${lock ? "FOR UPDATE" : ""}`,
    { replacements, type: QueryTypes.SELECT, transaction }
  );

  const draftRows = await db.query(
    `SELECT tk.id AS id_tiket_jadwal_produksi, t.id_mesin, t.mesin, tk.no_jo, tk.no_booking, p.tahapan,
            DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tgl, TIME_FORMAT(p.jam, '%H:%i:%s') AS jam
       FROM tiket_jadwal_produksi_per_jam p
       JOIN tiket_jadwal_produksi tk ON tk.id = p.id_tiket_jadwal_produksi
       JOIN tiket_jadwal_produksi_tahapan t ON t.id = p.id_tiket_jadwal_produksi_tahapan
      WHERE tk.status = 'calculated' AND tk.status_tiket = 'incoming'
        AND tk.id <> :idTiket
        AND p.tanggal >= :from AND p.tanggal < :to
        AND (t.mesin IN (:names) OR t.id_mesin IN (:ids))`,
    { replacements, type: QueryTypes.SELECT, transaction }
  );

  return createOccupancy({ rows, draftRows, excludeTiket });
};

/**
 * Data master mesin -> fungsi allowConcurrent(stage).
 * Mesin yang tidak ditemukan di master dianggap TIDAK boleh bersamaan (dicek bentrok).
 */
const createMesinMeta = (mesinRows = []) => {
  const byId = new Map();
  const byName = new Map();
  for (const m of mesinRows) {
    byId.set(Number(m.id), m);
    byName.set(norm(m.nama_mesin), m);
  }
  const find = (stage) =>
    (stage.id_mesin && byId.get(Number(stage.id_mesin))) ||
    byName.get(norm(stage.mesin)) ||
    null;
  return {
    find,
    allowConcurrent: (stage) => {
      const m = find(stage);
      return !!(m && m.allow_concurrent);
    },
  };
};

const loadMesinMeta = async ({ ids = [], names = [], transaction }) => {
  const where = [];
  const idList = [...new Set(ids.filter(Boolean).map(Number))];
  const nameList = [...new Set(names.filter(Boolean))];
  if (idList.length) where.push({ id: idList });
  if (nameList.length) where.push({ nama_mesin: nameList });
  const rows = where.length
    ? await MasterMesin.findAll({
        attributes: ["id", "nama_mesin", "type_kapasitas", "allow_concurrent"],
        where: { [Op.or]: where },
        transaction,
      })
    : [];
  return createMesinMeta(rows);
};

module.exports = {
  createOccupancy,
  loadOccupancy,
  createMesinMeta,
  loadMesinMeta,
};
