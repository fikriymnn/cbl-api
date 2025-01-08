const { Op, Sequelize, where } = require("sequelize");
const JadwalKaryawan = require("../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");

const db = require("../../../config/database");

const JadwalKaryawanController = {
  getJadwalKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, jenis_karyawan, libur_1_tahun } =
      req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };

    if (libur_1_tahun == "false") {
      obj.nama_jadwal = {
        [Op.notIn]: ["Sabtu", "Minggu"],
      };
    }

    if (start_date && end_date) {
      obj.tanggal = {
        [Op.between]: [
          new Date(start_date).setHours(0, 0, 0, 0),
          new Date(end_date).setHours(23, 59, 59, 999),
        ],
      };
    }

    if (jenis_karyawan) {
      obj.jenis_karyawan = jenis_karyawan;
    }

    try {
      if (page && limit) {
        const length = await JadwalKaryawan.count({ where: obj });
        const data = await JadwalKaryawan.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await JadwalKaryawan.findByPk(_id);
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await JadwalKaryawan.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createJadwalKaryawanSatuTahun: async (req, res) => {
    const { tahun, hari, jenis_karyawan } = req.body;
    const t = await db.transaction();

    try {
      // Daftar nama hari dalam bahasa Indonesia
      const daysMapping = {
        Minggu: 0,
        Senin: 1,
        Selasa: 2,
        Rabu: 3,
        Kamis: 4,
        Jumat: 5,
        Sabtu: 6,
      };
      // Konversi nama hari ke angka (0-6)
      const hariLiburIndexes = hari.map((hari) => daysMapping[hari]);

      // Generate semua tanggal dalam setahun
      const allDates = generateDatesInYear(tahun);

      // Filter tanggal berdasarkan hari libur yang dipilih
      const hariLibur = allDates.filter((date) =>
        hariLiburIndexes.includes(date.getDay())
      );
      // Format data untuk penyimpanan
      const dataLibur = hariLibur.map((date) => {
        const dayIndex = date.getDay(); // Mendapatkan indeks hari (0-6)
        const namaHari = Object.keys(daysMapping).find(
          (key) => daysMapping[key] === dayIndex
        ); // Nama hari berdasarkan indeks
        return {
          jenis_karyawan: jenis_karyawan,
          nama_jadwal: namaHari, // Nama jadwal diisi dengan nama hari
          tanggal: date,
        };
      });
      //Simpan data ke database
      await JadwalKaryawan.bulkCreate(dataLibur, { transaction: t });

      await t.commit();
      res.status(200).json({
        msg: "create successfully",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  createJadwalKaryawan: async (req, res) => {
    const { tanggal, nama_jadwal, produksi, staff } = req.body;
    const t = await db.transaction();

    try {
      let dataJadwal = [];
      if (produksi === true) {
        dataJadwal.push({
          tanggal: tanggal,
          nama_jadwal: nama_jadwal,
          jenis_karyawan: "produksi",
        });
      }

      if (staff === true) {
        dataJadwal.push({
          tanggal: tanggal,
          nama_jadwal: nama_jadwal,
          jenis_karyawan: "staff",
        });
      }
      await JadwalKaryawan.bulkCreate(dataJadwal, { transaction: t });

      await t.commit();
      res.status(200).json({
        msg: "create successfully",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateJadwalKaryawan: async (req, res) => {
    const _id = req.params.id;
    const { tanggal, nama_jadwal } = req.body;
    const t = await db.transaction();

    let obj = {};
    if (tanggal) obj.tanggal = tanggal;
    if (nama_jadwal) obj.tanggal = nama_jadwal;

    try {
      await JadwalKaryawan.update(obj, { where: { id: _id }, transaction: t });

      await t.commit();
      res.status(200).json({
        msg: "update successfully",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
  deleteJadwalKaryawan: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      await JadwalKaryawan.destroy({ where: { id: _id }, transaction: t });

      await t.commit();
      res.status(200).json({
        msg: "update successfully",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

const generateDatesInYear = (year) => {
  const dates = [];
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  while (startDate <= endDate) {
    dates.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }

  return dates;
};

module.exports = JadwalKaryawanController;
