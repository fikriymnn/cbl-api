const { Op } = require("sequelize");
const MasterHargaPengiriman = require("../../../model/masterData/marketing/masterHargaPengirimanModel");
const db = require("../../../config/database");

const MasterHargaPengirimanController = {
  getMasterHargaPengiriman: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { nama_area: { [Op.like]: `%${search}%` } },
            { harga: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MasterHargaPengiriman.count({ where: obj });
        const data = await MasterHargaPengiriman.findAll({
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
        const response = await MasterHargaPengiriman.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterHargaPengiriman.findAll({ where: obj });
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

  createMasterHargaPengiriman: async (req, res) => {
    const { nama_area, harga } = req.body;
    const t = await db.transaction();
    if (!nama_area)
      return res
        .status(404)
        .json({
          succes: false,
          status_code: 404,
          msg: "nama area wajib di isi!!",
        });
    if (!harga)
      return res
        .status(404)
        .json({ succes: false, status_code: 404, msg: "harga wajib di isi!!" });

    try {
      const response = await MasterHargaPengiriman.create(
        {
          nama_area: nama_area,
          harga: harga,
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

  updateMasterHargaPengiriman: async (req, res) => {
    const _id = req.params.id;
    const { nama_area, harga, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (nama_area) obj.nama_area = nama_area;
      if (harga) obj.harga = harga;
      if (is_active) obj.is_active = is_active;
      const checkData = await MasterHargaPengiriman.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterHargaPengiriman.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await t.commit(),
        res
          .status(204)
          .json({ succes: true, status_code: 204, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  deleteMasterHargaPengiriman: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterHargaPengiriman.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterHargaPengiriman.destroy({
        where: { id: _id },
        transaction: t,
      }),
        await t.commit(),
        res
          .status(204)
          .json({ succes: true, status_code: 204, msg: "Delete Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = MasterHargaPengirimanController;
