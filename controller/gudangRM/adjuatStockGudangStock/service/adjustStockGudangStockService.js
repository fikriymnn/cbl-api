const db = require("../../../../config/database");
const { Op, Sequelize } = require("sequelize");
const AdjustStockGudangStock = require("../../../../model/gudangRM/adjustStockGudangStockModel");
const GudangRawmaterialStock = require("../../../../model/gudangRM/gudangRawMaterialStock/gudangRawMaterialStockModel");
const Users = require("../../../../model/userModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const MutasiBarangRawMaterialService = require("../../../gudangRM/mutasiBarangRawMaterial/service/mutasiBarangRawMaterialService");
const MutasiBarangRawMaterialStockService = require("../../../gudangRM/gudangRawMaterialStock/service/gudangRawMaterialStockService");

const AdjustStockRawMaterialStockService = {
  getAdjustStockRawMaterialStockService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_gudang_raw_material_stock,
    id_item,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [{ nama_item: { [Op.like]: `%${search}%` } }],
      };
    }
    if (id_gudang_raw_material_stock)
      obj.id_gudang_raw_material_stock = id_gudang_raw_material_stock;
    if (id_item) obj.id_item = id_item;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (page && limit) {
        const length = await AdjustStockGudangStock.count({ where: obj });
        const data = await AdjustStockGudangStock.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: Users,
              as: "user",
              attributes: ["id", "nama", "email"],
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await AdjustStockGudangStock.findByPk(id, {
          include: [
            {
              model: Users,
              as: "user",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await AdjustStockGudangStock.findAll({
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

  createAdjustStockRawMaterialStockService: async ({
    id_gudang_raw_material_stock,
    jumlah_qty_awal,
    jumlah_qty_adjust,
    note,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek data gudang raw material stock, sisa data (item, dll) diambil dari sini
      const dataGudangRmStock = await GudangRawmaterialStock.findByPk(
        id_gudang_raw_material_stock,
      );
      if (!dataGudangRmStock) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Gudang Raw Material Stock Tidak Ditemukan",
        };
      }

      const status =
        parseFloat(jumlah_qty_awal) > parseFloat(jumlah_qty_adjust)
          ? "pengurangan"
          : "penambahan";

      await AdjustStockGudangStock.create(
        {
          id_gudang_raw_material_stock: dataGudangRmStock.id,
          id_item: dataGudangRmStock.id_item,
          id_user: id_user,
          nama_item: dataGudangRmStock.nama_item,
          jumlah_qty_awal: jumlah_qty_awal,
          jumlah_qty_adjust: jumlah_qty_adjust,
          tgl_adjust: new Date(),
          status: status,
          note: note || null,
        },
        { transaction: t },
      );

      const qtyMutasiBarang =
        status === "pengurangan"
          ? jumlah_qty_awal - jumlah_qty_adjust
          : jumlah_qty_adjust - jumlah_qty_awal;

      const createMutasiBarang =
        await MutasiBarangRawMaterialService.creteMutasiBarangRawMaterialService(
          {
            id_item: dataGudangRmStock.id_item,
            id_user: id_user,
            tgl_mutasi: new Date(),
            jumlah_qty: qtyMutasiBarang,
            type_mutasi: status === "pengurangan" ? "keluar" : "masuk",
            sumber_mutasi: "adjust stock gudang stock",
            note: note || null,
            transaction: t,
          },
        );

      if (createMutasiBarang.success === false) {
        await t.rollback();

        throw {
          succes: false,
          status_code: 400,
          message: createMutasiBarang.message,
        };
      }

      const createMutasiBarangStock =
        await MutasiBarangRawMaterialStockService.createMutasiGudangRawMaterialStockService(
          {
            id_gudang_raw_material_stock: dataGudangRmStock.id,
            id_item: dataGudangRmStock.id_item,
            id_user: id_user,
            tgl_mutasi: new Date(),
            jumlah_qty: qtyMutasiBarang,
            type_mutasi: status === "pengurangan" ? "keluar" : "masuk",
            sumber_mutasi: "adjust stock gudang stock",
            note: note || null,
            transaction: t,
          },
        );

      if (createMutasiBarangStock.success === false) {
        await t.rollback();

        throw {
          succes: false,
          status_code: 400,
          message: createMutasiBarangStock.message,
        };
      }

      let objUpdate = {
        qty: jumlah_qty_adjust,
      };

      if (status === "penambahan") objUpdate.tgl_masuk = new Date();

      await GudangRawmaterialStock.update(objUpdate, {
        where: { id: dataGudangRmStock.id },
        transaction: t,
      });

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

  updateAdjustStockRawMaterialStockService: async ({
    id,
    jumlah_qty_awal,
    jumlah_qty_adjust,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek data adjust stock
      const dataAdjustStock = await AdjustStockGudangStock.findByPk(id);
      if (!dataAdjustStock) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Adjust Stock Tidak Ditemukan",
        };
      }

      const qtyAwal =
        jumlah_qty_awal !== undefined
          ? jumlah_qty_awal
          : dataAdjustStock.jumlah_qty_awal;
      const qtyAdjust =
        jumlah_qty_adjust !== undefined
          ? jumlah_qty_adjust
          : dataAdjustStock.jumlah_qty_adjust;

      const status =
        parseFloat(qtyAwal) > parseFloat(qtyAdjust)
          ? "pengurangan"
          : "penambahan";

      await AdjustStockGudangStock.update(
        {
          jumlah_qty_awal: qtyAwal,
          jumlah_qty_adjust: qtyAdjust,
          status: status,
          note: note !== undefined ? note : dataAdjustStock.note,
        },
        { where: { id: id }, transaction: t },
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
};

module.exports = AdjustStockRawMaterialStockService;
