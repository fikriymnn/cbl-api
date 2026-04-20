const { Op } = require("sequelize");
const db = require("../../../config/database");
const KapasitasMesin = require("../../../model/ppic/kapasitasMesin/kapsitasMesinModel");
const MasterMesin = require("../../../model/masterData/tahapan/masterMesinTahapanModel");

const kapasitasMesinController = {
  // GET all / GET by ID
  getKapasitasMesin: async (req, res) => {
    try {
      const { id } = req.params;
      const { tahun, id_mesin } = req.query;

      if (id) {
        const data = await KapasitasMesin.findByPk(id, {
          include: [{ model: MasterMesin, as: "mesin" }],
        });
        if (!data) {
          return res.status(404).json({
            success: false,
            status_code: 404,
            msg: "Data tidak ditemukan.",
          });
        }
        return res.status(200).json({ success: true, status_code: 200, data });
      }

      const whereClause = {};
      if (tahun) whereClause.tahun = tahun;
      if (id_mesin) whereClause.id_mesin = id_mesin;

      const data = await KapasitasMesin.findAll({
        where: whereClause,
        include: [{ model: MasterMesin, as: "mesin" }],
        order: [["tahun", "ASC"]],
      });

      return res.status(200).json({ success: true, status_code: 200, data });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: err.message });
    }
  },

  // CREATE
  createKapasitasMesin: async (req, res) => {
    const t = await db.transaction();
    try {
      const {
        id_mesin,
        tahun,
        jan,
        feb,
        mar,
        apr,
        mei,
        jun,
        jul,
        ags,
        sep,
        okt,
        nov,
        des,
      } = req.body;

      // Validasi field wajib
      if (
        !tahun ||
        !jan ||
        !feb ||
        !mar ||
        !apr ||
        !mei ||
        !jun ||
        !jul ||
        !ags ||
        !sep ||
        !okt ||
        !nov ||
        !des
      ) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          status_code: 400,
          msg: "Semua field bulan dan tahun wajib diisi.",
        });
      }

      // Cek duplikat mesin + tahun
      const existing = await KapasitasMesin.findOne({
        where: { id_mesin: id_mesin || null, tahun },
      });
      if (existing) {
        await t.rollback();
        return res.status(409).json({
          success: false,
          status_code: 409,
          msg: "Data kapasitas untuk mesin dan tahun ini sudah ada.",
        });
      }

      const data = await KapasitasMesin.create(
        {
          id_mesin,
          tahun,
          jan,
          feb,
          mar,
          apr,
          mei,
          jun,
          jul,
          ags,
          sep,
          okt,
          nov,
          des,
        },
        { transaction: t }
      );

      await t.commit();
      return res.status(201).json({
        success: true,
        status_code: 201,
        msg: "Data berhasil dibuat.",
        data,
      });
    } catch (err) {
      await t.rollback();
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: err.message });
    }
  },

  // UPDATE
  updateKapasitasMesin: async (req, res) => {
    const t = await db.transaction();
    try {
      const { id } = req.params;
      const {
        id_mesin,
        tahun,
        jan,
        feb,
        mar,
        apr,
        mei,
        jun,
        jul,
        ags,
        sep,
        okt,
        nov,
        des,
      } = req.body;

      const data = await KapasitasMesin.findByPk(id);
      if (!data) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          status_code: 404,
          msg: "Data tidak ditemukan.",
        });
      }

      // Cek duplikat jika mesin/tahun berubah
      if (
        (id_mesin !== undefined && id_mesin !== data.id_mesin) ||
        (tahun !== undefined && tahun !== data.tahun)
      ) {
        const duplicate = await KapasitasMesin.findOne({
          where: {
            id_mesin: id_mesin ?? data.id_mesin,
            tahun: tahun ?? data.tahun,
            id: { [Op.ne]: id },
          },
        });
        if (duplicate) {
          await t.rollback();
          return res.status(409).json({
            success: false,
            status_code: 409,
            msg: "Data kapasitas untuk mesin dan tahun ini sudah ada.",
          });
        }
      }

      await data.update(
        {
          id_mesin,
          tahun,
          jan,
          feb,
          mar,
          apr,
          mei,
          jun,
          jul,
          ags,
          sep,
          okt,
          nov,
          des,
        },
        { transaction: t }
      );

      await t.commit();
      return res
        .status(200)
        .json({
          success: true,
          status_code: 200,
          msg: "Data berhasil diupdate.",
          data,
        });
    } catch (err) {
      await t.rollback();
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: err.message });
    }
  },

  // DELETE
  deleteKapasitasMesin: async (req, res) => {
    const t = await db.transaction();
    try {
      const { id } = req.params;

      const data = await KapasitasMesin.findByPk(id);
      if (!data) {
        await t.rollback();
        return res
          .status(404)
          .json({
            success: false,
            status_code: 404,
            msg: "Data tidak ditemukan.",
          });
      }

      await data.destroy({ transaction: t });
      await t.commit();
      return res
        .status(200)
        .json({
          success: true,
          status_code: 200,
          msg: "Data berhasil dihapus.",
        });
    } catch (err) {
      await t.rollback();
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: err.message });
    }
  },
};

module.exports = kapasitasMesinController;
