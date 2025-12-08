const db = require("../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const MasterKendaraanModel = require("../../../../model/masterData/kendaraan/masterKendaraanModel");

const MasterKendaraanService = {
  getMasterKendaraanService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { nomor_kendaraan: { [Op.like]: `%${search}%` } },
          { nama_kendaraan: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await MasterKendaraanModel.count({ where: obj });
        const data = await MasterKendaraanModel.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await MasterKendaraanModel.findByPk(id);
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await MasterKendaraanModel.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      }
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteMasterKendaraanService: async ({
    nomor_kendaraan,
    nama_kendaraan,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      await MasterKendaraanModel.create(
        {
          nama_kendaraan: nama_kendaraan,
          nomor_kendaraan: nomor_kendaraan,
        },
        { transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  updateMasterKendaraanService: async ({
    id,
    nomor_kendaraan,
    nama_kendaraan,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      await MasterKendaraanModel.update(
        {
          nama_kendaraan: nama_kendaraan,
          nomor_kendaraan: nomor_kendaraan,
        },
        { where: { id: id }, transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "update success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  deleteMasterKendaraanService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      await MasterKendaraanModel.update(
        {
          is_active: false,
        },
        { where: { id: id }, transaction: t }
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "delete success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = MasterKendaraanService;
