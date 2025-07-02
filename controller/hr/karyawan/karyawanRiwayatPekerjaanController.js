const KaryawanRiwayatPekerjaan = require("../../../model/hr/karyawan/karyawanRiwayatPekerjaanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const Karyawan = require("../../../model/hr/karyawanModel");
const db = require("../../../config/database");

const karyawanRiwayatPekerjaanController = {
  getKaryawanRiwayatPekerjaan: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const data = await KaryawanRiwayatPekerjaan.findByPk(_id);
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await KaryawanRiwayatPekerjaan.findAll();
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createKaryawanRiwayatPekerjaan: async (req, res) => {
    const {
      id_karyawan,
      id_biodata_karyawan,
      dari_tahun,
      dari_bulan,
      sampai_tahun,
      sampai_bulan,
      nama_perusahaan,
      jabatan,
      keterangan,
    } = req.body;

    const t = await db.transaction();

    try {
      if (!id_karyawan || !id_biodata_karyawan)
        return res
          .status(400)
          .json({ msg: "id karyawan dan id biodata wajib di isi" });

      const dataKaryawan = await Karyawan.findByPk(id_karyawan);
      if (!dataKaryawan)
        return res.status(404).json({ msg: "karyawan tidak di temukan" });
      const dataBiodata = await KaryawanBiodata.findByPk(id_biodata_karyawan);
      if (!dataBiodata)
        return res
          .status(404)
          .json({ msg: "karyawan biodata tidak di temukan" });
      await KaryawanRiwayatPekerjaan.create(
        {
          id_karyawan,
          id_biodata_karyawan,
          dari_tahun,
          dari_bulan,
          sampai_tahun,
          sampai_bulan,
          nama_perusahaan,
          jabatan,
          keterangan,
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

  updateKaryawanRiwayatPekerjaan: async (req, res) => {
    const _id = req.params.id;
    const {
      dari_tahun,
      dari_bulan,
      sampai_tahun,
      sampai_bulan,
      nama_perusahaan,
      jabatan,
      keterangan,
    } = req.body;
    const t = await db.transaction();
    let obj = {};
    //console.log(req.body);

    if (dari_tahun) obj.dari_tahun = dari_tahun;
    if (dari_bulan) obj.dari_bulan = dari_bulan;
    if (sampai_tahun) obj.sampai_tahun = sampai_tahun;
    if (sampai_bulan) obj.sampai_bulan = sampai_bulan;
    if (nama_perusahaan) obj.nama_perusahaan = nama_perusahaan;
    if (jabatan) obj.jabatan = jabatan;
    if (keterangan) obj.keterangan = keterangan;

    try {
      await KaryawanRiwayatPekerjaan.update(
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

  deleteKaryawanRiwayatPekerjaan: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      await KaryawanRiwayatPekerjaan.destroy({
        where: { id: _id },
        transaction: t,
      });

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

module.exports = karyawanRiwayatPekerjaanController;
