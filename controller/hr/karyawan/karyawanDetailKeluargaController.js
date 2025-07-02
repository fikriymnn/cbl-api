const KaryawanDetailKeluarga = require("../../../model/hr/karyawan/karyawanDetailKeluargaModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const Karyawan = require("../../../model/hr/karyawanModel");
const db = require("../../../config/database");

const karyawanDetailKeluargaController = {
  getKaryawanDetailKeluarga: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const data = await KaryawanDetailKeluarga.findByPk(_id);
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await KaryawanDetailKeluarga.findAll();
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createKaryawanDetailKeluarga: async (req, res) => {
    const {
      id_karyawan,
      id_biodata_karyawan,
      status_kawin,
      jumlah_tanggungan,
      nama_pasangan,
      tempat_lahir_pasangan,
      tanggal_lahir_pasangan,
      pendidikan_pasangan,
      pekerjaan_pasangan,
      nama_ayah,
      tempat_lahir_ayah,
      tanggal_lahir_ayah,
      pendidikan_ayah,
      pekerjaan_ayah,
      nama_ibu,
      tempat_lahir_ibu,
      tanggal_lahir_ibu,
      pendidikan_ibu,
      pekerjaan_ibu,
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
      await KaryawanDetailKeluarga.create(
        {
          id_karyawan,
          id_biodata_karyawan,
          status_kawin,
          jumlah_tanggungan,
          nama_pasangan,
          tempat_lahir_pasangan,
          tanggal_lahir_pasangan,
          pendidikan_pasangan,
          pekerjaan_pasangan,
          nama_ayah,
          tempat_lahir_ayah,
          tanggal_lahir_ayah,
          pendidikan_ayah,
          pekerjaan_ayah,
          nama_ibu,
          tempat_lahir_ibu,
          tanggal_lahir_ibu,
          pendidikan_ibu,
          pekerjaan_ibu,
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

  updateKaryawanDetailKeluarga: async (req, res) => {
    const _id = req.params.id;
    const {
      status_kawin,
      jumlah_tanggungan,
      nama_pasangan,
      tempat_lahir_pasangan,
      tanggal_lahir_pasangan,
      pendidikan_pasangan,
      pekerjaan_pasangan,
      nama_ayah,
      tempat_lahir_ayah,
      tanggal_lahir_ayah,
      pendidikan_ayah,
      pekerjaan_ayah,
      nama_ibu,
      tempat_lahir_ibu,
      tanggal_lahir_ibu,
      pendidikan_ibu,
      pekerjaan_ibu,
    } = req.body;
    const t = await db.transaction();
    let obj = {};
    //console.log(req.body);

    if (status_kawin) obj.status_kawin = status_kawin;
    if (jumlah_tanggungan) obj.jumlah_tanggungan = jumlah_tanggungan;
    if (nama_pasangan) obj.nama_pasangan = nama_pasangan;
    if (tempat_lahir_pasangan)
      obj.tempat_lahir_pasangan = tempat_lahir_pasangan;
    if (tanggal_lahir_pasangan)
      obj.tanggal_lahir_pasangan = tanggal_lahir_pasangan;
    if (pendidikan_pasangan) obj.pendidikan_pasangan = pendidikan_pasangan;
    if (pekerjaan_pasangan) obj.pekerjaan_pasangan = pekerjaan_pasangan;
    if (nama_ayah) obj.nama_ayah = nama_ayah;
    if (tempat_lahir_ayah) obj.tempat_lahir_ayah = tempat_lahir_ayah;
    if (tanggal_lahir_ayah) obj.tanggal_lahir_ayah = tanggal_lahir_ayah;
    if (pendidikan_ayah) obj.pendidikan_ayah = pendidikan_ayah;
    if (pekerjaan_ayah) obj.pekerjaan_ayah = pekerjaan_ayah;
    if (nama_ibu) obj.nama_ibu = nama_ibu;
    if (tempat_lahir_ibu) obj.tempat_lahir_ibu = tempat_lahir_ibu;
    if (tanggal_lahir_ibu) obj.tanggal_lahir_ibu = tanggal_lahir_ibu;
    if (pendidikan_ibu) obj.pendidikan_ibu = pendidikan_ibu;
    if (pekerjaan_ibu) obj.pekerjaan_ibu = pekerjaan_ibu;

    try {
      await KaryawanDetailKeluarga.update(
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

  deleteKaryawanDetailKeluarga: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      await KaryawanDetailKeluarga.destroy({
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

module.exports = karyawanDetailKeluargaController;
