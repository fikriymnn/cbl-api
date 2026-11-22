// Utilitas waktu & penyusunan slot per jam untuk jadwal produksi.
// Semua fungsi murni (tanpa database).

const HOUR_MS = 60 * 60 * 1000;
// batas pencarian slot supaya tidak loop tanpa akhir (±400 hari)
const MAX_SEARCH_HOURS = 24 * 400;

const pad = (n) => String(n).padStart(2, "0");

const addHours = (date, hours) => new Date(date.getTime() + hours * HOUR_MS);

const floorHour = (date) => {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  return d;
};

const ceilHour = (date) => {
  const d = floorHour(date);
  return d.getTime() < new Date(date).getTime() ? addHours(d, 1) : d;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const maxDate = (a, b) => (a.getTime() >= b.getTime() ? a : b);

// "YYYY-MM-DD HH:mm" (waktu lokal server = Asia/Jakarta)
const fmtDateTime = (date) =>
  date
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    : null;

// "YYYY-MM-DD"
const fmtDate = (date) =>
  date
    ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    : null;

/* ---- format tampilan (HANYA untuk teks pesan / label) ----
 * Jangan dipakai untuk field data, kunci occupancy, query, atau kolom DB:
 * semua itu tetap memakai fmtDate / fmtDateTime (YYYY-MM-DD [HH:mm]).
 */
const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// "06 Desember 2026"
const fmtTanggalIndo = (date) =>
  date
    ? `${pad(date.getDate())} ${NAMA_BULAN[date.getMonth()]} ${date.getFullYear()}`
    : null;

// "06 Desember 2026 08:00"
const fmtWaktuIndo = (date) =>
  date
    ? `${fmtTanggalIndo(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    : null;

// "HH:mm:ss"
const fmtTime = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

// format lama kolom tgl_from / tgl_to: "YYYY-MM-DD HH.mm.ss"
const fmtTglFromTo = (date) =>
  `${fmtDate(date)} ${pad(date.getHours())}.${pad(date.getMinutes())}.${pad(
    date.getSeconds()
  )}`;

/**
 * Parse "YYYY-MM-DD", "YYYY-MM-DD HH:mm", "YYYY-MM-DDTHH:mm[:ss]" sebagai waktu lokal.
 * Return null kalau format tidak valid.
 */
const parseLocalDateTime = (value) => {
  if (value instanceof Date) return isNaN(value) ? null : new Date(value);
  if (typeof value !== "string") return null;
  const m = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return null;
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4] || 0),
    Number(m[5] || 0),
    Number(m[6] || 0)
  );
  return isNaN(d) ? null : d;
};

/**
 * Susun slot 1 jam MAJU mulai dari `start`.
 * isWorking(t) -> jam kerja?  isBlocked(t) -> jam sudah terpakai? (opsional)
 * Return array Date (urut naik) atau null kalau tidak ketemu dalam batas pencarian.
 */
const layForward = ({ start, durasi, isWorking, isBlocked }) => {
  const slots = [];
  let t = ceilHour(start);
  let guard = 0;
  while (slots.length < durasi) {
    if (++guard > MAX_SEARCH_HOURS) return null;
    if (isWorking(t) && !(isBlocked && isBlocked(t))) slots.push(t);
    t = addHours(t, 1);
  }
  return slots;
};

/**
 * Susun slot 1 jam MUNDUR sehingga slot terakhir selesai paling lambat `end`.
 * Return array Date (urut naik) atau null kalau tidak ketemu dalam batas pencarian.
 */
const layBackward = ({ end, durasi, isWorking, isBlocked }) => {
  const slots = [];
  let t = addHours(floorHour(end), -1);
  let guard = 0;
  while (slots.length < durasi) {
    if (++guard > MAX_SEARCH_HOURS) return null;
    if (isWorking(t) && !(isBlocked && isBlocked(t))) slots.unshift(t);
    t = addHours(t, -1);
  }
  return slots;
};

module.exports = {
  HOUR_MS,
  addHours,
  floorHour,
  ceilHour,
  startOfDay,
  maxDate,
  fmtDateTime,
  fmtDate,
  fmtTime,
  fmtTglFromTo,
  fmtTanggalIndo,
  fmtWaktuIndo,
  parseLocalDateTime,
  layForward,
  layBackward,
};
