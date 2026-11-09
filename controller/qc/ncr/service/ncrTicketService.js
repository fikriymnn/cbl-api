const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");
const Users = require("../../../../model/userModel");
const { createCapaFromNcr } = require("../../capa/service/capaTiketService");
const { terapkanBatasQty } = require("../../../../helper/batasQtyFunction");

const NAMA_PROSES = {
  cetak: "Cetak",
  coating: "Coating",
  pond: "Pond",
  lem: "Lem",
  rabut: "Rabut",
  amparLem: "Ampar Lem",
};

// Membuat tiket NCR beserta department dan poin ketidaksesuaiannya.
// departments: [{ id_department, department, ketidaksesuaian: ["teks", ...] }]
const createNcr = async ({ data, departments, transaction = null }) => {
  const t = transaction || (await db.transaction());
  try {
    const ncr = await NcrTicket.create(
      { tanggal: new Date(), ...data },
      { transaction: t }
    );

    for (const item of departments) {
      const department = await NcrDepartment.create(
        {
          id_ncr_tiket: ncr.id,
          id_department: item.id_department,
          department: item.department,
        },
        { transaction: t }
      );

      for (const ketidaksesuaian of item.ketidaksesuaian) {
        await NcrKetidaksesuain.create(
          { id_department: department.id, ketidaksesuaian },
          { transaction: t }
        );
      }
    }

    if (!transaction) await t.commit();
    return ncr;
  } catch (error) {
    if (!transaction) await t.rollback();
    throw error;
  }
};

// Tipe qty: dijalankan saat inspeksi selesai, satu NCR per kode masalah.
const createNcrQtyInspeksi = async ({
  proses,
  DefectModel,
  DepartmentModel,
  kolomDepartment,
  kolomDefect,
  whereInspeksi,
  whereDefect = {},
  inspeksi,
  idPelapor,
}) => {
  const semuaDefect = await DefectModel.findAll({
    attributes: [
      [Sequelize.fn("SUM", Sequelize.col(kolomDefect)), kolomDefect],
      "id",
      "kode",
      "sumber_masalah",
      "persen_kriteria",
      "kriteria",
      "masalah",
    ],
    group: ["kode"],
    where: { ...whereInspeksi, ...whereDefect },
  });

  const pointDefect = await terapkanBatasQty(
    proses,
    DefectModel,
    whereInspeksi,
    semuaDefect
  );

  const pointDefectDepartment = [];
  for (const point of pointDefect) {
    const departments = await DepartmentModel.findAll({
      where: { [kolomDepartment]: point.id },
    });
    pointDefectDepartment.push(departments);

    const persen = (point[kolomDefect] / inspeksi.jumlah_pcs) * 100;
    if (!(persen >= point.persen_kriteria)) continue;

    if (point.sumber_masalah == "Mesin") {
      console.log("masuk os");
      continue;
    }

    const user = await Users.findByPk(idPelapor);
    const ketidaksesuaian = `masalah pada proses ${NAMA_PROSES[proses]} dengan kode ${point.kode} - ${point.masalah} dengan kriteria ${point.kriteria}`;

    await createNcr({
      data: {
        id_pelapor: idPelapor,
        tipe_ncr: "qty",
        kategori_laporan: point.sumber_masalah,
        no_jo: inspeksi.no_jo,
        no_io: inspeksi.no_io,
        qty_defect: point[kolomDefect],
        nama_produk: inspeksi.nama_produk,
        department_pelapor: "QUALITY CONTROL",
        nama_pelapor: user.nama,
      },
      departments: departments.map((department) => ({
        id_department: department.id_department,
        department: department.nama_department,
        ketidaksesuaian: [ketidaksesuaian],
      })),
    });
  }

  return pointDefectDepartment;
};

// Tipe frekuensi: NCR selalu tercatat, CAPA hanya dibuat setelah batas terlewati.
const createNcrFrekuensi = async ({
  tiket,
  kodeKendala,
  idPelapor,
  namaPelapor,
  jumlahTiket,
  transaction,
}) => {
  const melebihiBatas = jumlahTiket + 1 > tiket.maksimal_kedatangan_tiket;
  const ketidaksesuaian = `Kendala ${kodeKendala} ${tiket.nama_kendala} ${
    melebihiBatas ? "telah melebihi" : "belum melebihi"
  } batas maksimal`;

  const ncr = await createNcr({
    data: {
      id_pelapor: idPelapor,
      tipe_ncr: "frekuensi",
      status: melebihiBatas ? "di teruskan ke capa" : "tercatat",
      bagian_tiket: "history",
      kategori_laporan: tiket.jenis_kendala,
      nama_pelapor: namaPelapor,
      department_pelapor: "QUALITY CONTROL",
      no_jo: tiket.no_jo,
      no_io: tiket.no_io,
      nama_produk: tiket.nama_produk,
    },
    departments: tiket.data_department.map((department) => ({
      id_department: department.id_department,
      department: department.department,
      ketidaksesuaian: [ketidaksesuaian],
    })),
    transaction,
  });

  if (melebihiBatas) await createCapaFromNcr(ncr.id, transaction);
  return ncr;
};

// Tipe waktu: NCR dibuat jika durasi pengerjaan melebihi batas.
const createNcrWaktu = async ({
  tiket,
  kodeKendala,
  durasiMenit,
  pelapor,
  departments,
  transaction,
}) => {
  if (!(durasiMenit > tiket.maksimal_waktu_pengerjaan)) return null;

  const ketidaksesuaian = `Melebihi batas waktu penanganan masalah ${kodeKendala} ${tiket.nama_kendala} pada jo ${tiket.no_jo}`;

  return createNcr({
    data: {
      ...pelapor,
      tipe_ncr: "waktu",
      kategori_laporan: tiket.jenis_kendala,
      no_jo: tiket.no_jo,
      no_io: tiket.no_io,
      nama_produk: tiket.nama_produk,
    },
    departments: departments.map((department) => ({
      id_department: department.id_department,
      department: department.department,
      ketidaksesuaian: [ketidaksesuaian],
    })),
    transaction,
  });
};

module.exports = {
  createNcr,
  createNcrQtyInspeksi,
  createNcrFrekuensi,
  createNcrWaktu,
};
