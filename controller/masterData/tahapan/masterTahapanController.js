const { Op } = require("sequelize");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const db = require("../../../config/database");

const MasterTahapanController = {
  getMasterTahapan: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { kode_tahapan: { [Op.like]: `%${search}%` } },
            { nama_tahapan: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MasterTahapan.count({ where: obj });
        const data = await MasterTahapan.findAll({
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
        const response = await MasterTahapan.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterTahapan.findAll({ where: obj });
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

  createMasterTahapan: async (req, res) => {
    const { kode_tahapan, nama_tahapan } = req.body;
    const t = await db.transaction();
    if (!nama_tahapan)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "nama tahapan wajib di isi!!",
      });

    try {
      const response = await MasterTahapan.create(
        {
          kode_tahapan: kode_tahapan,
          nama_tahapan: nama_tahapan,
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

  updateMasterTahapan: async (req, res) => {
    const _id = req.params.id;
    const { kode_tahapan, nama_tahapan, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (kode_tahapan) obj.kode_tahapan = kode_tahapan;
      if (nama_tahapan) obj.nama_tahapan = nama_tahapan;
      if (is_active) obj.is_active = is_active;
      const checkData = await MasterTahapan.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterTahapan.update(obj, {
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

  deleteMasterTahapan: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterTahapan.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterTahapan.destroy({
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

module.exports = MasterTahapanController;
