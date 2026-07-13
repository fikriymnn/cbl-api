const { Op, Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterVendor = require("../../../model/masterData/marketing/masterVendorModel");

const MasterVendorController = {
  getMasterVendor: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search, tipe_vendor } = req.query;

    try {
      let obj = { is_active: true };
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { nama_vendor: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { alamat: { [Op.like]: `%${search}%` } },
            { telepon: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      obj.is_active = true;
      if (is_active) obj.is_active = is_active === "true" ? true : false;

      // --- filter tipe_vendor (JSON array) ---
      let andConditions = [];
      if (tipe_vendor) {
        // dukung single value atau multiple (comma separated / array dari query)
        const tipeArray = Array.isArray(tipe_vendor)
          ? tipe_vendor
          : tipe_vendor.split(",");

        andConditions = tipeArray.map((tipe) =>
          Sequelize.where(
            Sequelize.fn(
              "JSON_CONTAINS",
              Sequelize.col("tipe_vendor"),
              JSON.stringify(tipe.trim())
            ),
            1
          )
        );
      }

      // gabungkan obj (is_active/search) dengan filter tipe_vendor pakai Op.and
      const whereClause = andConditions.length
        ? { [Op.and]: [obj, { [Op.or]: andConditions }] }
        : obj;
      if (page && limit) {
        const length = await MasterVendor.count({ where: whereClause });
        const data = await MasterVendor.findAll({
          where: whereClause,
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
        const response = await MasterVendor.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterVendor.findAll({
          where: whereClause,
        });
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

  createMasterVendor: async (req, res) => {
    const { nama_vendor, email, alamat, telepon, tipe_vendor } = req.body;
    const t = await db.transaction();
    try {
      const response = await MasterVendor.create(
        {
          nama_vendor,
          email,
          alamat,
          telepon,
          tipe_vendor,
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

  updateMasterVendor: async (req, res) => {
    const _id = req.params.id;
    const { nama_vendor, email, alamat, telepon, tipe_vendor } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};

      if (nama_vendor) obj.nama_vendor = nama_vendor;
      if (email) obj.email = email;
      if (alamat) obj.alamat = alamat;
      if (telepon) obj.telepon = telepon;
      if (tipe_vendor) obj.tipe_vendor = tipe_vendor;

      const checkData = await MasterVendor.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data Vendor tidak ditemukan",
        });
      await MasterVendor.update(obj, {
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

  deleteMasterVendor: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterVendor.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterVendor.update(
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

module.exports = MasterVendorController;
