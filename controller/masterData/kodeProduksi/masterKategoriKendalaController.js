const { Op } = require("sequelize");
const MasterKategoriKendala = require("../../../model/masterData/kodeProduksi/masterKategoriKendalaModel");
const db = require("../../../config/database");

const MasterKategoriKendalaController = {
  getMasterKategoriKendala: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [{ kategori: { [Op.like]: `%${search}%` } }],
        };
      }
      if (is_active) obj.is_active = is_active == "true" ? true : false;
      if (page && limit) {
        const length = await MasterKategoriKendala.count({ where: obj });
        const data = await MasterKategoriKendala.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await MasterKategoriKendala.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterKategoriKendala.findAll({ where: obj });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      }
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createMasterKategoriKendala: async (req, res) => {
    const { kategori } = req.body;
    const t = await db.transaction();
    if (!kategori)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "Kategori wajib di isi!!",
      });

    try {
      const response = await MasterKategoriKendala.create(
        {
          kategori: kategori,
        },
        { transaction: t }
      );
      await t.commit();
      return res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successful",
        data: response,
      });
    } catch (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  updateMasterKategoriKendala: async (req, res) => {
    const _id = req.params.id;
    const { kategori, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (kategori) obj.kategori = kategori;
      if (is_active) obj.is_active = is_active;
      const checkData = await MasterKategoriKendala.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterKategoriKendala.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  deleteMasterKategoriKendala: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterKategoriKendala.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterKategoriKendala.update(
        { is_active: false },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Delete Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = MasterKategoriKendalaController;
