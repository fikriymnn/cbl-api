const KaryawanRiwayatPendidikan = require("../../../model/hr/karyawan/karyawanRiwayatPendidikanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const Karyawan = require("../../../model/hr/karyawanModel");
const db = require("../../../config/database");

const karyawanRiwayatPendidikanController = {
  getKaryawanRiwayatPendidikan: async (req, res) => {
    const _id = req.params.id;
    const { id_karyawan, id_biodata_karyawan } = req.query;
    let obj = {};
    if (id_karyawan) obj.id_karyawan = id_karyawan;
    if (id_biodata_karyawan) obj.id_biodata_karyawan = id_biodata_karyawan;
    try {
      if (_id) {
        const data = await KaryawanRiwayatPendidikan.findByPk(_id);
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await KaryawanRiwayatPendidikan.findAll({ where: obj });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createKaryawanRiwayatPendidikan: async (req, res) => {
    const {
      id_karyawan,
      id_biodata_karyawan,
      tingkat,
      nama_sekolah,
      kota,
      jurusan,
      tahun_lulus,
      berijazah,
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
      await KaryawanRiwayatPendidikan.create(
        {
          id_karyawan,
          id_biodata_karyawan,
          tingkat,
          nama_sekolah,
          kota,
          jurusan,
          tahun_lulus,
          berijazah,
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

  updateKaryawanRiwayatPendidikan: async (req, res) => {
    const _id = req.params.id;
    const { tingkat, nama_sekolah, kota, jurusan, tahun_lulus, berijazah } =
      req.body;
    const t = await db.transaction();
    let obj = {};
    //console.log(req.body);

    if (tingkat) obj.tingkat = tingkat;
    if (nama_sekolah) obj.nama_sekolah = nama_sekolah;
    if (kota) obj.kota = kota;
    if (jurusan) obj.jurusan = jurusan;
    if (tahun_lulus) obj.tahun_lulus = tahun_lulus;
    if (berijazah) obj.berijazah = berijazah;

    try {
      await KaryawanRiwayatPendidikan.update(
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

  deleteKaryawanRiwayatPendidikan: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      await KaryawanRiwayatPendidikan.destroy({
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

module.exports = karyawanRiwayatPendidikanController;
