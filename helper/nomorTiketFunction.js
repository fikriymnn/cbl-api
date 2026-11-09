const { Op, literal } = require("sequelize");

// Menghasilkan nomor seperti NCR-0001/CBL/0926, urutan mulai dari 1 tiap bulan.
// Sama seperti invoice: ambil nomor terakhir di tabelnya lalu tambah 1.
const generateNomorTiket = async (Model, field, kode, transaction) => {
  const now = new Date();
  const bulan = String(now.getMonth() + 1).padStart(2, "0");
  const tahun = String(now.getFullYear()).slice(2);
  const suffix = `/CBL/${bulan}${tahun}`;

  const options = {
    attributes: [field],
    where: { [field]: { [Op.like]: `${kode}-%${suffix}` } },
    order: [
      [
        literal(
          `CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(${field}, '/', 1), '-', -1) AS UNSIGNED)`
        ),
        "DESC",
      ],
    ],
  };
  if (transaction) {
    options.transaction = transaction;
    options.lock = transaction.LOCK.UPDATE;
  }

  const last = await Model.findOne(options);
  const lastSequence = last
    ? parseInt(last[field].split("/")[0].split("-").pop(), 10) || 0
    : 0;

  return `${kode}-${String(lastSequence + 1).padStart(4, "0")}${suffix}`;
};

module.exports = { generateNomorTiket };
