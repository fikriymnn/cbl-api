const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../../model/hr/karyawanModel");
const OutstandingAbsen = require("../../../../model/hr/outstanding/outstandingAbsen/outstandingAbsenModel");
const KaryawanBiodata = require("../../../../model/hr/karyawan/karyawanBiodataModel");
const JadwalKaryawan = require("../../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const MasterDepartment = require("../../../../model/masterData/hr/masterDeprtmentModel");
const { getAbsensiFunction } = require("../../../../helper/absenFunction");
const db = require("../../../../config/database");

const OutstandingAbsenController = {
  getOutstandingAbsen: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, search, status, id_department, id_karyawan } =
      req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };
    if (status) obj.status = status;
    if (id_karyawan) obj.id_karyawan = id_karyawan;
    if (id_department) obj.id_department = id_department;
    try {
      if (page && limit) {
        const length = await OutstandingAbsen.count({ where: obj });
        const data = await OutstandingAbsen.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                },
              ],
            },
            {
              model: MasterDepartment,
              as: "department",
            },
          ],
          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await OutstandingAbsen.findByPk(_id, {
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                },
              ],
            },
            {
              model: MasterDepartment,
              as: "department",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await OutstandingAbsen.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: Karyawan,
              as: "karyawan",
              include: [
                {
                  model: KaryawanBiodata,
                  as: "biodata_karyawan",
                },
              ],
            },
            {
              model: MasterDepartment,
              as: "department",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getCronjobOutstandingAbsen: async (req, res) => {
    const t = await db.transaction();
    let obj = {};
    obj.is_active = true;

    try {
      const date = new Date();
      const dateYear = date.getFullYear();
      const dateMonth = date.getMonth() + 1;
      const dateDay = date.getDate();
      const today = `${dateYear}-${dateMonth}-${dateDay}`;
      const absenResult = await getAbsensiFunction(today, today, obj);

      const dataAbsenesult = absenResult.filter(
        (data) => data.status_absen == "Belum Masuk"
      );

      const dataJadwalKaryawan = await JadwalKaryawan.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          tanggal: {
            [Op.between]: [
              new Date(today).setHours(0, 0, 0, 0),
              new Date(today).setHours(23, 59, 59, 999),
            ],
          },
          is_active: true,
        },
      });

      // buat tanggal sesuai format
      const resultJadwalKaryawan = dataJadwalKaryawan.map((jadwal) => {
        const dateJadwal = new Date(jadwal.tanggal);
        const day = dateJadwal.getDate();
        const month = dateJadwal.getMonth() + 1;
        const year = dateJadwal.getFullYear();

        return {
          tanggal_libur: `${year}-${month}-${day}`,
          ...jadwal.toJSON(),
        };
      });

      for (let i = 0; i < dataAbsenesult.length; i++) {
        const dataAbsen = dataAbsenesult[i];

        const filterJadwalKaryawan = resultJadwalKaryawan.filter(
          (data) => data.jenis_karyawan == dataAbsen.tipe_karyawan
        );

        // Cek apakah tanggal hari ini ada di data lembur
        const isTodayOvertime = filterJadwalKaryawan.some(
          (data) => data.tanggal_libur == today
        );

        if (!isTodayOvertime) {
          await OutstandingAbsen.create(
            {
              id_karyawan: dataAbsen.userid,
              id_department: dataAbsen.id_department,
              tanggal: today,
              deskripsi: "Belum melakukan absen",
            },
            { transaction: t }
          );
        }
      }

      await t.commit();
      res.status(200).json({
        msg: "oke",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  doneOutstandingAbsen: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;
    const t = await db.transaction();

    try {
      const dataOutstandingAbsen = await OutstandingAbsen.findByPk(_id);
      if (!dataOutstandingAbsen)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await OutstandingAbsen.update(
        {
          status: "history",
          id_respon: req.user.id_karyawan,
          catatan: catatan,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();
      res.status(200).json({ msg: "Done Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = OutstandingAbsenController;
