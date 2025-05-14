const { Op, Sequelize, where } = require("sequelize");
const PengajuanCuti = require("../../model/hr/pengajuanCuti/pengajuanCutiModel");
const PengajuanIzin = require("../../model/hr/pengajuanIzin/pengajuanIzinModel");
const PengajuanLembur = require("../../model/hr/pengajuanLembur/pengajuanLemburModel");
const PengajuanMangkir = require("../../model/hr/pengajuanMangkir/pengajuanMangkirModel");
const PengajuanPinjaman = require("../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const PengajuanPromosiStatusKaryawan = require("../../model/hr/pengajuanPromosiStatusKaryawan/pengajuanPromosiStatusKaryawanModel");
const pengajuanTerlambat = require("../../model/hr/pengajuanTerlambat/pengajuanTerlambatModel");
const pengajuanDinas = require("../../model/hr/pengajuanDinas/pengajuanDinasModel");
const pengajuanSP = require("../../model/hr/pengajuanSP/pengajuanSPModel");
const pengajuanKaryawan = require("../../model/hr/pengajuanKaryawan/pengajuanKaryawanModel");
const PengajuanSakit = require("../../model/hr/pengajuanSakit/pengajuanSakitModel");

const db = require("../../config/database");

const IncomingTask = {
  getIncomingTask: async (req, res) => {
    try {
      const lengthCuti = await PengajuanCuti.count({
        where: { status_tiket: "incoming" },
      });
      const lengthIzin = await PengajuanIzin.count({
        where: { status_tiket: "incoming" },
      });
      const lengthLembur = await PengajuanLembur.count({
        where: { status_tiket: "incoming" },
      });
      const lengthMangkir = await PengajuanMangkir.count({
        where: { status_tiket: "incoming" },
      });
      const lengthPinjaman = await PengajuanPinjaman.count({
        where: { status_tiket: "incoming" },
      });
      const lengthSakit = await PengajuanSakit.count({
        where: { status_tiket: "incoming" },
      });
      const lengthPromosiStatusKaryawan =
        await PengajuanPromosiStatusKaryawan.count({
          where: { status_tiket: "incoming" },
        });

      const lengthTerlambat = await pengajuanTerlambat.count({
        where: { status_tiket: "incoming" },
      });
      const lengthDinas = await pengajuanDinas.count({
        where: { status_tiket: "incoming" },
      });
      const lengthSP = await pengajuanSP.count({
        where: { status_tiket: "incoming" },
      });

      const lengthPenambahanKaryawan = await pengajuanKaryawan.count({
        where: { status_tiket: "incoming" },
      });

      res.status(200).json({
        pengajuan_cuti: lengthCuti,
        pengajuan_izin: lengthIzin,
        pengajuan_lembur: lengthLembur,
        pengajuan_mangkir: lengthMangkir,
        pengajuan_pinjaman: lengthPinjaman,
        pengajuan_sakit: lengthSakit,
        pengajuan_promosi_status_karayawan: lengthPromosiStatusKaryawan,
        pengajuan_terlambat: lengthTerlambat,
        pengajuan_dinas: lengthDinas,
        pengajuan_sp: lengthSP,
        pengajuan_penambahan_karyawan: lengthPenambahanKaryawan,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = IncomingTask;
