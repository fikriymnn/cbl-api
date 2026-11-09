const { Op } = require("sequelize");
const MasterKodeProduksi = require("../model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterKriteriaKendala = require("../model/masterData/kodeProduksi/masterKriteriaKendalaModel");
const MasterTahapan = require("../model/masterData/tahapan/masterTahapanModel");

const COCOK_TAHAPAN = {
  cetak: (nama) => nama.includes("cetak"),
  coating: (nama) => nama.includes("coating"),
  pond: (nama) => nama.includes("pond"),
  lem: (nama) => nama.includes("lem") && !nama.includes("ampar"),
  rabut: (nama) => nama.includes("rabut"),
  amparLem: (nama) => nama.includes("ampar"),
};

// Mengambil batas persentase defect per kode dari master kode produksi.
// Satu kode bisa ada di beberapa tahapan, jadi dicocokkan juga dengan tahapannya.
const getBatasQty = async (proses, daftarKode) => {
  const rows = await MasterKodeProduksi.findAll({
    where: { kode: { [Op.in]: daftarKode }, is_active: true },
    include: [
      { model: MasterTahapan, as: "tahapan" },
      { model: MasterKriteriaKendala, as: "kriteria_qty_produksi" },
    ],
    order: [["id", "ASC"]],
  });

  const batasQty = new Map();
  for (const row of rows) {
    const namaTahapan = (row.tahapan?.nama_tahapan || "").toLowerCase();
    const kriteria = row.kriteria_qty_produksi;
    if (
      COCOK_TAHAPAN[proses](namaTahapan) &&
      kriteria &&
      kriteria.is_active !== false &&
      !batasQty.has(row.kode)
    ) {
      batasQty.set(row.kode, kriteria.value);
    }
  }
  return batasQty;
};

// Mengisi persen_kriteria dari master saat inspeksi selesai dan menyimpannya
// ke baris defect. Kode tanpa kriteria dibuang agar tidak menghasilkan NCR.
const terapkanBatasQty = async (proses, DefectModel, whereInspeksi, pointDefect) => {
  const batasQty = await getBatasQty(
    proses,
    pointDefect.map((point) => point.kode)
  );

  const hasil = [];
  for (const point of pointDefect) {
    if (!batasQty.has(point.kode)) {
      console.warn(
        `Kode ${point.kode} proses ${proses} belum punya kriteria qty, NCR dilewati`
      );
      continue;
    }
    const batas = batasQty.get(point.kode);
    await DefectModel.update(
      { persen_kriteria: batas },
      { where: { ...whereInspeksi, kode: point.kode } }
    );
    point.persen_kriteria = batas;
    hasil.push(point);
  }
  return hasil;
};

module.exports = { terapkanBatasQty };
