const KalibrasiAlatUkur = require("../../../model/qc/kalibrasiAlatUkur/kalibrasiAlatUkurModel");
const KalibrasiAlatUkurTiket = require("../../../model/qc/kalibrasiAlatUkur/kalibrasiAlatUkurTiketModel");
const MasterStatusKalibrasi = require("../../../model/masterData/qc/kalibrasiAlatUkur/masterStatusKalibrasiAlatUkurModel");
const MasterLokasiKalibrasi = require("../../../model/masterData/qc/kalibrasiAlatUkur/masterLokasiPenyimpananKalibrasiAlatUkurModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");
const { Op } = require("sequelize");

const KalibrasiAlatUkurController = {
  getKalibrasiAlatUkur: async (req, res) => {
    try {
      const { page, limit } = req.query;
      const id = req.params.id;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      if (page && limit) {
        const length = await KalibrasiAlatUkur.count();
        const data = await KalibrasiAlatUkur.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: KalibrasiAlatUkurTiket,
              as: "data_tiket",
              required: false,
              where: { status: "history" },
            },
            {
              model: MasterStatusKalibrasi,
              as: "status_kalibrasi",
            },
            {
              model: MasterLokasiKalibrasi,
              as: "lokasi_kalibrasi",
            },
          ],
          limit: parseInt(limit),
          offset,
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        // console.log(id);
        const data = await KalibrasiAlatUkur.findByPk(id, {
          include: [
            {
              model: KalibrasiAlatUkurTiket,
              as: "data_tiket",
              required: false,
              where: { status: "history" },
            },
            {
              model: MasterStatusKalibrasi,
              as: "status_kalibrasi",
            },
            {
              model: MasterLokasiKalibrasi,
              as: "lokasi_kalibrasi",
            },
          ],
        });

        return res.status(200).json({ data: data });
      } else {
        const data = await KalibrasiAlatUkur.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: KalibrasiAlatUkurTiket,
              as: "data_tiket",
              required: false,
              where: { status: "history" },
            },
            {
              model: MasterStatusKalibrasi,
              as: "status_kalibrasi",
            },
            {
              model: MasterLokasiKalibrasi,
              as: "lokasi_kalibrasi",
            },
          ],
        });
        return res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createKalibrasiAlatUkur: async (req, res) => {
    const {
      nama_alat_ukur,
      merk_model,
      no_seri,
      spesifikasi,
      lokasi_penyimpanan,
      status,
      frekuensi,
      kalibrasi_terakhir,
      masa_berlaku,
      sertifikat,
      keterangan,
      no_sertifikat,
      vendor,
      file,
    } = req.body;
    const t = await db.transaction();
    try {
      const data = await KalibrasiAlatUkur.create(
        {
          id_status: status,
          id_lokasi: lokasi_penyimpanan,
          nama_alat_ukur,
          merk_model,
          no_seri,
          spesifikasi,
          frekuensi,
          kalibrasi_terakhir,
          masa_berlaku,
          sertifikat,
          keterangan,
          no_sertifikat,
          vendor,
          file,
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(201).json({ msg: "create success", data: data });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  updateKalibrasiAlatUkur: async (req, res) => {
    const _id = req.params.id;
    const {
      id_status,
      id_lokasi,
      nama_alat_ukur,
      merk_model,
      no_seri,
      spesifikasi,
      lokasi_penyimpanan,
      status,
      frekuensi,
      kalibrasi_terakhir,
      masa_berlaku,
      sertifikat,
      keterangan,
      no_sertifikat,
      vendor,
      file,
    } = req.body;
    const t = await db.transaction();
    try {
      let obj = {};
      if (id_status) obj.id_status = id_status;
      if (id_lokasi) obj.id_lokasi = id_lokasi;
      if (status) obj.status = status;
      if (nama_alat_ukur) obj.nama_alat_ukur = nama_alat_ukur;
      if (merk_model) obj.merk_model = merk_model;
      if (no_seri) obj.no_seri = no_seri;
      if (spesifikasi) obj.spesifikasi = spesifikasi;
      if (lokasi_penyimpanan) obj.lokasi_penyimpanan = lokasi_penyimpanan;
      if (frekuensi) obj.frekuensi = frekuensi;
      if (kalibrasi_terakhir) obj.kalibrasi_terakhir = kalibrasi_terakhir;
      if (masa_berlaku) obj.masa_berlaku = masa_berlaku;
      if (sertifikat) obj.sertifikat = sertifikat;
      if (keterangan) obj.keterangan = keterangan;
      if (no_sertifikat) obj.no_sertifikat = no_sertifikat;
      if (vendor) obj.vendor = vendor;
      if (file) obj.file = file;
      const data = await KalibrasiAlatUkur.update(obj, {
        where: { id: _id },
        transaction: t,
      });

      await t.commit();

      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  checkExparedKalibrasiAlatUkur: async (req, res) => {
    const t = await db.transaction();
    try {
      // tanggal sekarang
      const now = new Date();

      // tanggal 3 bulan ke depan
      const threeMonthsLater = new Date();
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

      const checkDataTiket = await KalibrasiAlatUkurTiket.findAll({
        where: { status: "incoming" },
      });
      const dataAlat = await KalibrasiAlatUkur.findAll({
        where: {
          masa_berlaku: {
            [Op.between]: [now, threeMonthsLater],
          },
        },
      });

      for (let i = 0; i < dataAlat.length; i++) {
        const data = dataAlat[i];
        const checkDataCombine = checkDataTiket.find(
          (tiket) => tiket.id_kalibrasi_alat_ukur == data.id
        );
        if (!checkDataCombine) {
          await KalibrasiAlatUkurTiket.create(
            {
              id_kalibrasi_alat_ukur: data.id,
            },
            { transaction: t }
          );
        }
      }
      await t.commit();
      return res.status(201).json({ data: "success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = KalibrasiAlatUkurController;
