const { Op, Sequelize } = require("sequelize");
const JadwalProduksi = require("../../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const db = require("../../../config/database");
const moment = require("moment-timezone");

const jadwalProduksiViewController = {
  getJadwalProduksiView: async (req, res) => {
    try {
      const { status, start_date, end_date, mesin, page, limit, search } =
        req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      if (id) {
        const dataById = await JadwalProduksi.findByPk(id);
        res.status(200).json({ data: dataById });
      } else {
        const data = await JadwalProduksi.findAll({
          where: {
            tanggal: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          },
        });
        res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createJadwalProduksiView: async (req, res) => {
    const t = await db.transaction();
    try {
      const data = await JadwalProduksi.bulkCreate(dataDumy, {
        transaction: t,
      });
      await t.commit();
      res.status(200).json({ msg: "create success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  updateJadwalProduksiView: async (req, res) => {
    const _id = req.params.id;
    const { data_jadwal } = req.body;
    const t = await db.transaction();
    try {
      // Cari data yang akan diubah berdasarkan ID
      const dataToUpdate = await JadwalProduksi.findByPk(_id);

      if (!dataToUpdate) {
        return { message: "Data tidak ditemukan." };
      }

      const lastTanggal = new Date(dataToUpdate.tanggal);
      const lastDate = lastTanggal.toISOString().split("T")[0];

      const newTanggal = new Date(data_jadwal.tanggal);
      const newDate = newTanggal.toISOString().split("T")[0];

      // Menggunakan moment untuk mengonversi waktu ke zona waktu lokal dan UTC
      const originalDateTime = moment.utc(`${lastDate}T${dataToUpdate.jam}`);
      const newDateTime = moment.utc(`${newDate}T${data_jadwal.jam}`);

      // Menghitung selisih waktu dalam milidetik
      const timeDifference = newDateTime.diff(originalDateTime);

      console.log(originalDateTime);

      // Update data yang diubah
      await JadwalProduksi.update(
        { tanggal: data_jadwal.tanggal, jam: data_jadwal.jam },
        { where: { id: _id }, transaction: t }
      );

      // Ambil semua data berikutnya berdasarkan tanggal dan jam
      const subsequentData = await JadwalProduksi.findAll({
        where: {
          [Op.or]: [
            {
              tanggal: {
                [Op.gt]: dataToUpdate.tanggal, // Tanggal lebih besar
              },
            },
            {
              tanggal: dataToUpdate.tanggal, // Tanggal sama tetapi jam lebih besar
              jam: {
                [Op.gt]: dataToUpdate.jam,
              },
            },
          ],
          mesin: data_jadwal.mesin,
        },
        order: [
          ["tanggal", "ASC"],
          ["jam", "ASC"],
        ],
      });

      // Update data berikutnya sesuai dengan selisih waktu dan pertahankan interval antar data
      let lastUpdatedDateTime = newDateTime;

      for (const data of subsequentData) {
        const lastTanggal = new Date(data.tanggal);
        const lastDate = lastTanggal.toISOString().split("T")[0];

        const currentDateTime = moment.utc(`${lastDate}T${data.jam}`);

        // Tambahkan selisih waktu ke data berikutnya
        const updatedDateTime = moment(currentDateTime).add(
          timeDifference,
          "milliseconds"
        );

        // Perbarui tanggal dan jam dengan format yang benar
        const updatedDate = updatedDateTime.toISOString().split("T")[0];
        const updatedTime = updatedDateTime
          .toISOString()
          .split("T")[1]
          .split(".")[0];

        await JadwalProduksi.update(
          {
            tanggal: updatedDate,
            jam: updatedTime,
          },
          { where: { id: data.id }, transaction: t }
        );

        // Perbarui waktu untuk data selanjutnya
        lastUpdatedDateTime = updatedDateTime;
      }
      await t.commit();

      res.status(200).json({ msg: "update success" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

const dataDumy = [
  {
    item: "Jago Bar",
    no_jo: "24-00003",
    qty_pcs: 100000,
    qty_druk: 13100,
    tahapan: "Cetak",
    from: "druk",
    nama_kategori: "2 Warna",
    kategori: "B",
    kategori_drying_time: "B",
    mesin: "R700",
    kapasitas_per_jam: 2500,
    drying_time: 48,
    seting: 2,
    kapasitas: 5.24,
    toleransi: 0,
    total_waktu: 55.24,
    tanggal: "2025-01-16",
    jam: "08:00:00",
  },
  {
    item: "Jago Bar",
    no_jo: "24-00003",
    qty_pcs: 100000,
    qty_druk: 13100,
    tahapan: "Cetak",
    from: "druk",
    nama_kategori: "2 Warna",
    kategori: "B",
    kategori_drying_time: "B",
    mesin: "R700",
    kapasitas_per_jam: 2500,
    drying_time: 48,
    seting: 2,
    kapasitas: 5.24,
    toleransi: 0,
    total_waktu: 55.24,
    tanggal: "2025-01-16",
    jam: "09:00:00",
  },
  {
    item: "Jago Bar",
    no_jo: "24-00003",
    qty_pcs: 100000,
    qty_druk: 13100,
    tahapan: "Cetak",
    from: "druk",
    nama_kategori: "2 Warna",
    kategori: "B",
    kategori_drying_time: "B",
    mesin: "R700",
    kapasitas_per_jam: 2500,
    drying_time: 48,
    seting: 2,
    kapasitas: 5.24,
    toleransi: 0,
    total_waktu: 55.24,
    tanggal: "2025-01-16",
    jam: "10:00:00",
  },
  {
    item: "Jago Bar",
    no_jo: "24-00003",
    qty_pcs: 100000,
    qty_druk: 13100,
    tahapan: "Cetak",
    from: "druk",
    nama_kategori: "2 Warna",
    kategori: "B",
    kategori_drying_time: "B",
    mesin: "R700",
    kapasitas_per_jam: 2500,
    drying_time: 48,
    seting: 2,
    kapasitas: 5.24,
    toleransi: 0,
    total_waktu: 55.24,
    tanggal: "2025-01-16",
    jam: "11:00:00",
  },
];

module.exports = jadwalProduksiViewController;
