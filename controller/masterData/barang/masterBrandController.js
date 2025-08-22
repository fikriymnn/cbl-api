const { Op } = require("sequelize");
const MasterBrand = require("../../../model/masterData/barang/masterBrandModel");
const db = require("../../../config/database");

const MasterBrandController = {
  getMasterBrand: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { kode_brand: { [Op.like]: `%${search}%` } },
            { nama_brand: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MasterBrand.count({ where: obj });
        const data = await MasterBrand.findAll({
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
        const response = await MasterBrand.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterBrand.findAll({ where: obj });
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

  createMasterBrand: async (req, res) => {
    const { kode_brand, nama_brand } = req.body;
    const t = await db.transaction();
    if (!kode_brand)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "kode brand wajib di isi!!",
      });
    if (!nama_brand)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "nama brand wajib di isi!!",
      });

    try {
      const response = await MasterBrand.create(
        {
          kode_brand: kode_brand,
          nama_brand: nama_brand,
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

  updateMasterBrand: async (req, res) => {
    const _id = req.params.id;
    const { kode_brand, nama_brand, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (kode_brand) obj.kode_brand = kode_brand;
      if (nama_brand) obj.nama_brand = nama_brand;
      if (is_active) obj.is_active = is_active;
      const checkData = await MasterBrand.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterBrand.update(obj, {
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

  deleteMasterBrand: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterBrand.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterBrand.destroy({
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

module.exports = MasterBrandController;
