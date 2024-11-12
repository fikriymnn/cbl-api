const { Op, Sequelize, where } = require("sequelize");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanPinjaman = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const db = require("../../../config/database");

const PengajuanPinjamanController = {
  getPengajuanPinjaman: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    // if (search)
    //   obj = {
    //     [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
    //   };
    try {
      if (page && limit) {
        const length = await PengajuanPinjaman.count({ where: obj });
        const data = await PengajuanPinjaman.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await PengajuanPinjaman.findByPk(_id, {
          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await PengajuanPinjaman.findAll({
          order: [["createdAt", "DESC"]],

          include: [
            {
              model: Karyawan,
              as: "karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan_pengaju",
            },
            {
              model: Karyawan,
              as: "karyawan_hr",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createPengajuanPinjaman: async (req, res) => {
    const {
      id_karyawan,
      id_pengaju,
      jumlah_pinjaman,
      jumlah_cicilan,
      tempo_cicilan,

      tipe_cicilan,
      sisa_pinjaman,
      jaminan_pinjaman,
      keperluan_pinjaman,
      sumber_pinjaman,
    } = req.body;
    const t = await db.transaction();

    try {
      const checkLimitPinjaman = await KaryawanBiodata.findOne({
        where: {
          id_karyawan: id_karyawan,
        },
      });

      const checkPinjamanBelumLunas = await PengajuanPinjaman.findAll({
        where: {
          id_karyawan: id_karyawan,
          status_pinjaman: "belum lunas",
        },
      });

      if (jumlah_pinjaman > checkLimitPinjaman.limit_pinjaman)
        return res
          .status(500)
          .json({ msg: "Pinjaman tidak boleh melebihi limit pinjaman" });

      if (checkPinjamanBelumLunas.length > 0)
        return res
          .status(500)
          .json({ msg: "Terdapat pinjaman yang belum lunas" });

      const dataPengajuanPinjaman = await PengajuanPinjaman.create(
        {
          id_karyawan,
          id_pengaju: id_pengaju,
          jumlah_pinjaman,
          jumlah_cicilan,
          tempo_cicilan,
          sisa_tempo_cicilan: tempo_cicilan,
          tipe_cicilan,
          sisa_pinjaman,
          jaminan_pinjaman,
          keperluan_pinjaman,
          sumber_pinjaman,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({
        data: dataPengajuanPinjaman,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  approvePengajuanPinjaman: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanPinjaman = await PengajuanPinjaman.findByPk(_id);
      if (!dataPengajuanPinjaman)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanPinjaman.update(
        {
          status: "approved",
          status_tiket: "history",
          status_pinjaman: "belum lunas",
          id_hr: req.user.id_karyawan,
          catatan_hr: catatan_hr,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();
      res.status(200).json({ msg: "Approve Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  rejectPengajuanPinjaman: async (req, res) => {
    const _id = req.params.id;
    const { catatan_hr } = req.body;
    const t = await db.transaction();

    try {
      const dataPengajuanPinjaman = await PengajuanPinjaman.findByPk(_id);
      if (!dataPengajuanPinjaman)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await PengajuanPinjaman.update(
        {
          status: "rejected",
          status_tiket: "history",
          id_hr: req.user.id_karyawan,
          catatan_hr: catatan_hr,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();

      res.status(200).json({ msg: "Reject Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PengajuanPinjamanController;
