const KaryawanDetailInformasi = require("../../../model/hr/karyawan/karyawanDetailInformasiModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const Karyawan = require("../../../model/hr/karyawanModel");
const db = require("../../../config/database");

const karyawanDetailInformasiController = {
  getKaryawanDetailInformasi: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const data = await KaryawanDetailInformasi.findByPk(_id);
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await KaryawanDetailInformasi.findAll();
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createKaryawanDetailInformasi: async (req, res) => {
    const {
      id_karyawan,
      id_biodata_karyawan,
      tempat_lahir,
      tanggal_lahir,
      agama,
      golongan_darah,
      kewarganegaraan,
      alamat,
      telepon,
      hp,
      email,
      no_npwp,
      nama_npwp,
      alamat_npwp,
      tanggal_terdaftar_npwp,
      no_ktp,
      masa_berlaku_ktp,
      no_jamsotek,
      sim_1,
      sim_2,
      is_jpk_khusus,
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
      await KaryawanDetailInformasi.create(
        {
          id_karyawan,
          id_biodata_karyawan,
          tempat_lahir,
          tanggal_lahir,
          agama,
          golongan_darah,
          kewarganegaraan,
          alamat,
          telepon,
          hp,
          email,
          no_npwp,
          nama_npwp,
          alamat_npwp,
          tanggal_terdaftar_npwp,
          no_ktp,
          masa_berlaku_ktp,
          no_jamsotek,
          sim_1,
          sim_2,
          is_jpk_khusus,
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

  updateKaryawanDetailInformasi: async (req, res) => {
    const _id = req.params.id;
    const {
      tempat_lahir,
      tanggal_lahir,
      agama,
      golongan_darah,
      kewarganegaraan,
      alamat,
      telepon,
      hp,
      email,
      no_npwp,
      nama_npwp,
      alamat_npwp,
      tanggal_terdaftar_npwp,
      no_ktp,
      masa_berlaku_ktp,
      no_jamsotek,
      sim_1,
      sim_2,
      is_jpk_khusus,
    } = req.body;
    const t = await db.transaction();
    let obj = {};
    //console.log(req.body);

    if (tempat_lahir) obj.tempat_lahir = tempat_lahir;
    if (tanggal_lahir) obj.tanggal_lahir = tanggal_lahir;
    if (agama) obj.agama = agama;
    if (golongan_darah) obj.golongan_darah = golongan_darah;
    if (kewarganegaraan) obj.kewarganegaraan = kewarganegaraan;
    if (alamat) obj.alamat = alamat;
    if (telepon) obj.telepon = telepon;
    if (hp) obj.hp = hp;
    if (email) obj.email = email;
    if (no_npwp) obj.no_npwp = no_npwp;
    if (nama_npwp) obj.nama_npwp = nama_npwp;
    if (alamat_npwp) obj.alamat_npwp = alamat_npwp;
    if (tanggal_terdaftar_npwp)
      obj.tanggal_terdaftar_npwp = tanggal_terdaftar_npwp;
    if (no_ktp) obj.no_ktp = no_ktp;
    if (masa_berlaku_ktp) obj.masa_berlaku_ktp = masa_berlaku_ktp;
    if (no_jamsotek) obj.no_jamsotek = no_jamsotek;
    if (sim_1) obj.sim_1 = sim_1;
    if (sim_2) obj.sim_2 = sim_2;
    if (is_jpk_khusus) obj.is_jpk_khusus = is_jpk_khusus;

    try {
      await KaryawanDetailInformasi.update(
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

  deleteKaryawanDetailInformasi: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      await KaryawanDetailInformasi.destroy({
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

module.exports = karyawanDetailInformasiController;
