const { Op, Sequelize } = require("sequelize");
const JadwalProduksi = require("../../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const JadwalLemburProduksi = require("../../../model/ppic/jadwalProduksi/jadwalLemburModel");
const masterShift = require("../../../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../../../model/masterData/hr/masterShift/masterIstirahatModel");
const JadwalKaryawan = require("../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const db = require("../../../config/database");
const moment = require("moment-timezone");
const lemburFunction = require("../../../helper/lemburJadwalProduksiMonlyFunction");

const jadwalLemburProduksiViewController = {
  getJadwalLemburProduksiWeeklyView: async (req, res) => {
    const { start_date, end_date } = req.query;
    try {
      const data = await JadwalLemburProduksi.findAll({
        where: {
          tanggal_lembur: {
            [Op.between]: [
              new Date(start_date).setHours(0, 0, 0, 0),
              new Date(end_date).setHours(23, 59, 59, 999),
            ],
          },
        },
      });
      res.status(200).json({ data: data });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createLemburMonlyJadwalProduksiView: async (req, res) => {
    const { data_lembur, mesin } = req.body;

    const t = await db.transaction();
    data_lembur.sort(
      (a, b) => new Date(a.tanggal_lembur) - new Date(b.tanggal_lembur)
    );

    try {
      const updated_list_lembur = data_lembur.map((item) => ({
        ...item,
        mesin: mesin,
        nama_user: req.user.name,
      }));
      const tanggalTarget = data_lembur[0].tanggal_lembur;
      const data = await JadwalProduksi.findOne({
        where: {
          tanggal: {
            [Op.gte]: `${tanggalTarget}T00:00:00.000Z`,
            [Op.lt]: `${tanggalTarget}T23:59:59.999Z`,
          },
          mesin: {
            [Op.like]: `%${mesin}%`,
          },
        },
        order: [["jam", "ASC"]],
      });

      if (!data) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      await lemburFunction.changeLemburMonly(data, data_lembur, data.id);
      await JadwalLemburProduksi.bulkCreate(updated_list_lembur, {
        transaction: t,
      });
      await t.commit();
      res.status(200).json({ msg: "update success" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = jadwalLemburProduksiViewController;
