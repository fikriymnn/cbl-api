const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const OutstandingKaryawan = require("../../../model/hr/outstanding/outstandingKaryawan/outstandingKaryawanModel");
const KendalaLkhTiket = require("../../../model/kendalaLkh/kendalaLkhTiketModel");
const PengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const OutstandingAbsen = require("../../../model/hr/outstanding/outstandingAbsen/outstandingAbsenModel");

const db = require("../../../config/database");

const OutstandingIncomingController = {
  //untuk list outstanding yang belum di kerjakan hr
  getOutstandingIncomingHr: async (req, res) => {
    const t = await db.transaction();

    try {
      const dataOutstandingKaryawan = await OutstandingKaryawan.count({
        where: { status: "incoming" },
      });
      const dataAllKendala = await KendalaLkhTiket.count({
        where: { status_tiket: "incoming", id_department: 21 },
      });
      const dataAbsensi = await OutstandingAbsen.count({
        where: { status: "incoming" },
      });
      const dataKetidaksesuaianSpl = await PengajuanLembur.count({
        where: { status_ketidaksesuaian: "incoming" },
      });

      res.status(200).json({
        data: {
          otsAllKendala: dataAllKendala,
          otsKaryawan: dataOutstandingKaryawan,
          otsAbsensi: dataAbsensi,
          otsKetidaksesuaianSpl: dataKetidaksesuaianSpl,
        },
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = OutstandingIncomingController;
