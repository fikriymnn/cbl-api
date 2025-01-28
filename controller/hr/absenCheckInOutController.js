const { Op, fn, col, literal, Sequelize } = require("sequelize");
const absensi = require("../../model/hr/absenModel");
const Karyawan = require("../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../model/hr/karyawan/karyawanBiodataModel");
const db = require("../../config/database");

const AbsensiCheckInOutController = {
  getAbsensiCheckinOut: async (req, res) => {
    const { id_karyawan, startDate, endDate } = req.query;

    const fromDateUTC = new Date(`${startDate}T00:00:00.000Z`); // Awal hari UTC
    const toDateMasukUTC = new Date(`${endDate}T23:59:59.999Z`);

    let obj = {};
    let obj2 = {};
    if (id_karyawan) {
      (obj.userid = id_karyawan), (obj2.id_karyawan = id_karyawan);
    }
    if (startDate && endDate)
      obj.checktime = { [Op.between]: [fromDateUTC, toDateMasukUTC] };

    try {
      const karyawanBiodata = await KaryawanBiodata.findAll({
        where: obj2,
      });

      // Ekstrak id_karyawan dari hasil query
      const karyawanIds = karyawanBiodata.map((biodata) => biodata.id_karyawan);
      const karyawan = await Karyawan.findAll({
        where: {
          userid: {
            [Op.in]: karyawanIds, // Gunakan array id_karyawan
          },
        },
      });

      const absenResult = await absensi.findAll({
        where: obj,
      });

      let dataResult = [];
      for (let i = 0; i < absenResult.length; i++) {
        const dataAbsen = absenResult[i];
        const waktuCheck = new Date(dataAbsen.checktime);

        const tglCheck = `${waktuCheck.getUTCDate()}-${
          waktuCheck.getUTCMonth() + 1
        }-${waktuCheck.getFullYear()}`;

        const jamCheck = `${waktuCheck.getUTCHours()}:${waktuCheck.getUTCMinutes()}:${waktuCheck.getUTCSeconds()}`;

        // Cari data karyawan berdasarkan id_karyawan
        const resultFindKaryawan = karyawan.find(
          (data) => data.userid === dataAbsen.userid
        );
        // Cari data biodata berdasarkan id_karyawan
        const resultFindBiodata = karyawanBiodata.find(
          (data) => data.id_karyawan === dataAbsen.userid
        );

        dataResult.push({
          userid: dataAbsen.userid,
          nama: resultFindKaryawan.name,
          checkTime: dataAbsen.checktime,
          tglCheck: `${tglCheck} ${jamCheck}`,
          checkType: dataAbsen.checktype == "0" ? "Masuk" : "Keluar",
        });
      }
      res.status(200).json({ data: dataResult });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createAbsensiCheckinOut: async (req, res) => {
    const { id_karyawan, type_check, date, jam } = req.body;

    const dateCheck = new Date(`${date}T${jam}Z`);

    const t = await db.transaction();

    try {
      const absenResult = await absensi.create(
        {
          userid: id_karyawan,
          checktype: type_check,
          checktime: dateCheck,
        },
        { transaction: t }
      );

      await t.commit();
      res.status(200).json({ data: absenResult });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateAbsensiCheckinOut: async (req, res) => {
    const { id_karyawan, checktime, type_check, date, jam } = req.body;

    let obj = {};
    if (type_check != null) obj.checktype = type_check;
    if (date && jam) {
      const dateCheck = new Date(`${date}T${jam}Z`);
      console.log(dateCheck);
      obj.checktime = dateCheck;
    }

    const t = await db.transaction();
    try {
      const update = await absensi.update(obj, {
        where: {
          userid: id_karyawan,
          checktime: checktime,
        },
        transaction: t,
      });

      await t.commit();
      res.status(200).json({ msg: "update success" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
  deleteAbsensiCheckinOut: async (req, res) => {
    const { id_karyawan, checktime } = req.body;

    const t = await db.transaction();
    try {
      await absensi.destroy({
        where: {
          userid: id_karyawan,
          checktime: checktime,
        },
        transaction: t,
      });
      await db.commit();
      res.status(200).json({ msg: "delete success" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = AbsensiCheckInOutController;
