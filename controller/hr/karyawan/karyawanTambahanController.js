const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const KaryawanTambahan = require("../../../model/hr/karyawan/karyawanTambahanModel");

const db = require("../../../config/database");

const karyawanTambahanController = {
  getKaryawanTambahan: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const data = await KaryawanTambahan.findByPk(_id);
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await KaryawanTambahan.findAll();
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createKaryawanTambahan: async (req, res) => {
    const { id_biodata_karyawan, nama_tambahan, jumlah_tambahan } = req.body;
    const t = await db.transaction();

    try {
      const biodataKaryawanData =
        await KaryawanBiodata.findByPk(id_biodata_karyawan);
      if (!biodataKaryawanData)
        return res.status(404).json({ msg: "Biodata karyawan not found" });
      const dataPotonganKaryawan = await KaryawanTambahan.create(
        {
          id_karyawan: biodataKaryawanData.id_karyawan,
          id_biodata_karyawan: id_biodata_karyawan,
          nama_tambahan,
          jumlah_tambahan,
        },
        { transaction: t },
      );

      await t.commit();
      res.status(200).json({
        data: dataPotonganKaryawan,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateKaryawanTambahan: async (req, res) => {
    const _id = req.params.id;
    const { nama_tambahan, jumlah_tambahan } = req.body;

    const t = await db.transaction();
    let obj = {};

    if (nama_tambahan) obj.nama_tambahan = nama_tambahan;
    if (jumlah_tambahan) obj.jumlah_tambahan = jumlah_tambahan;

    try {
      await KaryawanTambahan.update(
        {
          nama_tambahan: obj.nama_tambahan,
          jumlah_tambahan: obj.jumlah_tambahan,
        },
        { where: { id: _id }, transaction: t },
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

  deleteKaryawanTambahan: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      await KaryawanTambahan.destroy({ where: { id: _id }, transaction: t });

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

module.exports = karyawanTambahanController;
