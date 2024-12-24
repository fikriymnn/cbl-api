const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const KaryawanPotongan = require("../../../model/hr/karyawan/karyawanPotonganModel");

const db = require("../../../config/database");

const karyawanPotonganController = {
  getKaryawanPotongan: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const data = await KaryawanPotongan.findByPk(_id);
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await KaryawanPotongan.findAll();
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createKaryawanPotongan: async (req, res) => {
    const { id_biodata_karyawan, nama_potongan, jumlah_potongan } = req.body;
    const t = await db.transaction();

    try {
      const biodataKaryawanData = await KaryawanBiodata.findByPk(
        id_biodata_karyawan
      );
      if (!biodataKaryawanData)
        return res.status(404).json({ msg: "Biodata karyawan not found" });
      const dataPotonganKaryawan = await KaryawanPotongan.create(
        {
          id_karyawan: biodataKaryawanData.id_karyawan,
          id_biodata_karyawan: id_biodata_karyawan,
          nama_potongan,
          jumlah_potongan,
        },
        { transaction: t }
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

  updateKaryawanPotongan: async (req, res) => {
    const _id = req.params.id;
    const { nama_potongan, jumlah_potongan } = req.body;

    const t = await db.transaction();
    let obj = {};

    if (nama_potongan) obj.nama_potongan = nama_potongan;
    if (jumlah_potongan) obj.jumlah_potongan = jumlah_potongan;

    try {
      await KaryawanPotongan.update(
        {
          nama_potongan,
          jumlah_potongan,
        },
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

  deleteKaryawanPotongan: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      await KaryawanPotongan.destroy({ where: { id: _id }, transaction: t });

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

module.exports = karyawanPotonganController;
