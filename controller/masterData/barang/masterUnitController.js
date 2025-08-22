const { Op } = require("sequelize");
const MasterUnit = require("../../../model/masterData/barang/masterUnitModel");
const db = require("../../../config/database");

const MasterUnitController = {
  getMasterUnit: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { kode_unit: { [Op.like]: `%${search}%` } },
            { nama_unit: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MasterUnit.count({ where: obj });
        const data = await MasterUnit.findAll({
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
        const response = await MasterUnit.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterUnit.findAll({ where: obj });
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

  createMasterUnit: async (req, res) => {
    const { kode_unit, nama_unit } = req.body;
    const t = await db.transaction();
    if (!kode_unit)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "kode unit wajib di isi!!",
      });
    if (!nama_unit)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "nama unit wajib di isi!!",
      });

    try {
      const response = await MasterUnit.create(
        {
          kode_unit: kode_unit,
          nama_unit: nama_unit,
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

  updateMasterUnit: async (req, res) => {
    const _id = req.params.id;
    const { kode_unit, nama_unit, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (kode_unit) obj.kode_unit = kode_unit;
      if (nama_unit) obj.nama_unit = nama_unit;
      if (is_active) obj.is_active = is_active;
      const checkData = await MasterUnit.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterUnit.update(obj, {
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

  deleteMasterUnit: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterUnit.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterUnit.destroy({
        where: { id: _id },
        transaction: t,
      }),
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

module.exports = MasterUnitController;
