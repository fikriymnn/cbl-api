const { Op } = require("sequelize");
const MasterKriteriaKendala = require("../../../model/masterData/kodeProduksi/masterKriteriaKendalaModel");
const db = require("../../../config/database");

const MasterKriteriaKendalaController = {
  getMasterKriteriaKendala: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [{ kriteria: { [Op.like]: `%${search}%` } }],
          [Op.or]: [{ value: { [Op.like]: `%${search}%` } }],
          [Op.or]: [{ tipe: { [Op.like]: `%${search}%` } }],
          [Op.or]: [{ bagian: { [Op.like]: `%${search}%` } }],
        };
      }
      if (is_active) obj.is_active = is_active == "true" ? true : false;
      if (page && limit) {
        const length = await MasterKriteriaKendala.count({ where: obj });
        const data = await MasterKriteriaKendala.findAll({
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
        const response = await MasterKriteriaKendala.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterKriteriaKendala.findAll({ where: obj });
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

  createMasterKriteriaKendala: async (req, res) => {
    const { kriteria, value, tipe, bagian } = req.body;
    const t = await db.transaction();
    if (!kriteria || !value || !tipe || !bagian)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "Semua wajib di isi!!",
      });

    try {
      const response = await MasterKriteriaKendala.create(
        {
          kriteria,
          value,
          tipe,
          bagian,
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

  updateMasterKriteriaKendala: async (req, res) => {
    const _id = req.params.id;
    const { kriteria, value, tipe, bagian, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (kriteria) obj.kriteria = kriteria;
      if (value) obj.value = value;
      if (tipe) obj.tipe = tipe;
      if (bagian) obj.bagian = bagian;
      if (is_active) obj.is_active = is_active;
      const checkData = await MasterKriteriaKendala.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterKriteriaKendala.update(obj, {
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

  deleteMasterKriteriaKendala: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterKriteriaKendala.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterKriteriaKendala.update(
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

module.exports = MasterKriteriaKendalaController;
