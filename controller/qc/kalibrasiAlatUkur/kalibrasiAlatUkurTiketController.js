const KalibrasiAlatUkur = require("../../../model/qc/kalibrasiAlatUkur/kalibrasiAlatUkurModel");
const KalibrasiAlatUkurTiket = require("../../../model/qc/kalibrasiAlatUkur/kalibrasiAlatUkurTiketModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");
const { Op } = require("sequelize");

const KalibrasiAlatUkurTiketController = {
  getKalibrasiAlatUkurTiket: async (req, res) => {
    const { page, limit, status } = req.query;
    const id = req.params.id;
    try {
      let obj = {};
      if (status) obj.status = status;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      if (page && limit) {
        const length = await KalibrasiAlatUkurTiket.count();
        const data = await KalibrasiAlatUkurTiket.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: KalibrasiAlatUkur,
              as: "kalibrasi_alat_ukur",
            },
          ],
          limit: parseInt(limit),
          offset,
          where: obj,
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        // console.log(id);
        const data = await KalibrasiAlatUkurTiket.findByPk(id, {
          include: [
            {
              model: KalibrasiAlatUkur,
              as: "kalibrasi_alat_ukur",
            },
          ],
        });

        return res.status(200).json({ data: data });
      } else {
        const data = await KalibrasiAlatUkurTiket.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: KalibrasiAlatUkur,
              as: "kalibrasi_alat_ukur",
            },
          ],
          where: obj,
        });
        return res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createKalibrasiAlatUkurTiket: async (req, res) => {
    const { id_kalibrasi_alat_ukur } = req.body;
    const t = await db.transaction();
    try {
      const data = await KalibrasiAlatUkurTiket.create(
        {
          id_kalibrasi_alat_ukur,
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

  updateKalibrasiAlatUkurTiket: async (req, res) => {
    const _id = req.params.id;
    const { id_kalibrasi_alat_ukur } = req.body;
    const t = await db.transaction();
    try {
      let obj = {};

      if (id_kalibrasi_alat_ukur)
        obj.id_kalibrasi_alat_ukur = id_kalibrasi_alat_ukur;

      const data = await KalibrasiAlatUkurTiket.update(obj, {
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

  doneKalibrasiAlatUkurTiket: async (req, res) => {
    const _id = req.params.id;
    const { tgl_kalibrasi } = req.body;
    const t = await db.transaction();
    try {
      if (!tgl_kalibrasi)
        return res.status(500).json({ msg: "tgl_kalibrasi required" });
      const dataTiket = await KalibrasiAlatUkurTiket.findByPk(_id);
      if (!dataTiket)
        return res.status(404).json({ msg: "data tiket tidak di temukan" });
      const dataKalibrasi = await KalibrasiAlatUkur.findByPk(
        dataTiket.id_kalibrasi_alat_ukur
      );
      if (!dataKalibrasi)
        return res
          .status(404)
          .json({ msg: "data kalibrasi alat ukur tidak di temukan" });
      const tglKalibrasi = new Date(tgl_kalibrasi); // tanggal hari ini
      const masaBerlaku = new Date(tglKalibrasi); // salin tanggal hari ini
      masaBerlaku.setFullYear(
        tglKalibrasi.getFullYear() + dataKalibrasi.frekuensi
      ); // tambah 1 tahun

      await KalibrasiAlatUkurTiket.update(
        {
          status: "history",
          tgl_kalibrasi: tgl_kalibrasi,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await KalibrasiAlatUkur.update(
        {
          kalibrasi_terakhir: tglKalibrasi,
          masa_berlaku: masaBerlaku,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();

      return res.status(201).json({ msg: "update success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = KalibrasiAlatUkurTiketController;
