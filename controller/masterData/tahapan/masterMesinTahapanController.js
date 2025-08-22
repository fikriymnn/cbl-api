const { Op } = require("sequelize");
const MasterMesinTahapan = require("../../../model/masterData/tahapan/masterMesinTahapanModel");
const db = require("../../../config/database");

const MasterMesinTahapanController = {
  getMasterMesinTahapan: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { kode_mesin: { [Op.like]: `%${search}%` } },
            { nama_mesin: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MasterMesinTahapan.count({ where: obj });
        const data = await MasterMesinTahapan.findAll({
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
        const response = await MasterMesinTahapan.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterMesinTahapan.findAll({ where: obj });
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

  createMasterMesinTahapan: async (req, res) => {
    const { kode_mesin, nama_mesin } = req.body;
    const t = await db.transaction();
    if (!nama_mesin)
      return res
        .status(404)
        .json({
          succes: false,
          status_code: 404,
          msg: "nama mesin wajib di isi!!",
        });

    try {
      const response = await MasterMesinTahapan.create(
        {
          kode_mesin: kode_mesin,
          nama_mesin: nama_mesin,
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

  updateMasterMesinTahapan: async (req, res) => {
    const _id = req.params.id;
    const { kode_mesin, nama_mesin, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (kode_mesin) obj.kode_mesin = kode_mesin;
      if (nama_mesin) obj.nama_mesin = nama_mesin;
      if (is_active) obj.is_active = is_active;
      const checkData = await MasterMesinTahapan.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterMesinTahapan.update(obj, {
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

  deleteMasterMesinTahapan: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterMesinTahapan.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterMesinTahapan.destroy({
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

module.exports = MasterMesinTahapanController;
