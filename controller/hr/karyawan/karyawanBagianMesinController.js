const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterCuti = require("../../../model/masterData/hr/masterCutiModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const MasterGradeHr = require("../../../model/masterData/hr/masterGradeModel");
const PinjamanKaryawan = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const KaryawanPotongan = require("../../../model/hr/karyawan/karyawanPotonganModel");
const KaryawanBagianMesin = require("../../../model/hr/karyawan/karyawanBagianMesinModel");
const MasterStatusKaryawan = require("../../../model/masterData/hr/masterStatusKaryawanModel");
const HistoriPromosiStatusKaryawan = require("../../../model/hr/pengajuanPromosiStatusKaryawan/hisroryPromosiStatusKaryawanModel");
const db = require("../../../config/database");

const karyawanBagianMesinController = {
  createKaryawanBagianMesin: async (req, res) => {
    const {
      id_karyawan,
      id_biodata_karyawan,
      id_bagian_mesin,
      nama_bagian_mesin,
    } = req.body;

    const t = await db.transaction();

    try {
      await KaryawanBagianMesin.create(
        {
          id_karyawan,
          id_biodata_karyawan,
          id_bagian_mesin,
          nama_bagian_mesin,
        },
        { transaction: t }
      );

      await t.commit();
      res.status(200).json({
        data: "create successful",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateKaryawanBagianMesin: async (req, res) => {
    const _id = req.params.id;
    const { id_bagian_mesin, nama_bagian_mesin } = req.body;
    const t = await db.transaction();
    let obj = {};
    console.log(req.body);

    if (id_bagian_mesin) obj.id_bagian_mesin = id_bagian_mesin;
    if (nama_bagian_mesin) obj.nama_bagian_mesin = nama_bagian_mesin;

    try {
      await KaryawanBagianMesin.update(
        obj,

        { where: { id: _id }, transaction: t }
      );

      await t.commit();
      res.status(200).json({
        msg: "Update Successful",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  deleteKaryawanBagianMesin: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      await KaryawanBagianMesin.destroy({ where: { id: _id }, transaction: t });

      await t.commit();
      res.status(200).json({
        msg: "Delete Successful",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = karyawanBagianMesinController;
