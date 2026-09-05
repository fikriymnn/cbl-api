// service/stockOpnameRawMaterialService.js
const db = require("../../../../config/database");
const { Op } = require("sequelize");
const StockOpnameRawMaterial = require("../../../../model/gudangRM/stockOpnameRawMaterial/stockOpnameRawMaterialModel");
const StockOpnameRawMaterialItem = require("../../../../model/gudangRM/stockOpnameRawMaterial/stockOpnameRawMaterialItemModel");
const GudangRawMaterialBooking = require("../../../../model/gudangRM/gudangRawMaterialBookingModel");
const GudangRawMaterialStock = require("../../../../model/gudangRM/gudangRawMaterialStock/gudangRawMaterialStockModel");
const Users = require("../../../../model/userModel");
const MutasiBarangRawMaterialService = require("../../../gudangRM/mutasiBarangRawMaterial/service/mutasiBarangRawMaterialService");
const MutasiBarangRawMaterialStockService = require("../../../gudangRM/gudangRawMaterialStock/service/gudangRawMaterialStockService");

const StockOpnameRawMaterialService = {
  getStockOpnameRawMaterialService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    status,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (status) obj.status = status;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_create = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (id) {
        const data = await StockOpnameRawMaterial.findByPk(id, {
          include: [
            {
              model: StockOpnameRawMaterialItem,
              as: "stock_opname_raw_material_item",
              include: [
                { model: Users, as: "user_save" },
                { model: Users, as: "user_approve" },
                { model: Users, as: "user_reject" },
                {
                  model: GudangRawMaterialBooking,
                  as: "gudang_raw_material_booking",
                },
                {
                  model: GudangRawMaterialStock,
                  as: "gudang_raw_material_stock",
                },
              ],
            },
          ],
        });

        if (!data) {
          return {
            status: 404,
            success: false,
            message: "Data Stock Opname Raw Material Tidak Ditemukan",
          };
        }

        return { status: 200, success: true, data };
      } else if (page && limit) {
        const length = await StockOpnameRawMaterial.count({ where: obj });
        const data = await StockOpnameRawMaterial.findAll({
          order: [["tgl_create", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else {
        const data = await StockOpnameRawMaterial.findAll({
          order: [["tgl_create", "DESC"]],
          where: obj,
        });
        return { status: 200, success: true, data };
      }
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  createStockOpnameRawMaterialService: async ({ period, id_user }) => {
    const t = await db.transaction();

    try {
      if (!period) {
        await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "period tidak boleh kosong",
        };
      }

      const dataStockOpname = await StockOpnameRawMaterial.create(
        {
          id_user_create: id_user,
          period: period,
          tgl_create: new Date(),
          status: "draft",
        },
        { transaction: t },
      );

      const dataBooking = await GudangRawMaterialBooking.findAll({
        where: {
          is_active: true,
          status: "incoming",
        },
        transaction: t,
      });

      const dataStock = await GudangRawMaterialStock.findAll({
        where: {
          is_active: true,
          qty: { [Op.gt]: 0 },
        },
        transaction: t,
      });

      const itemFromBooking = dataBooking.map((item) => {
        return {
          id_stock_opname_raw_material: dataStockOpname.id,
          id_gudang_raw_material_booking: item.id,
          id_jo: item.id_jo,
          id_item: item.id_item,
          no_jo: item.no_jo,
          nama_item: item.nama_item,
          jumlah_qty: item.qty,
          sumber_gudang: "booking",
        };
      });

      const itemFromStock = dataStock.map((item) => {
        return {
          id_stock_opname_raw_material: dataStockOpname.id,
          id_gudang_raw_material_stock: item.id,
          id_item: item.id_item,
          nama_item: item.nama_item,
          jumlah_qty: item.qty,
          sumber_gudang: "stock",
        };
      });

      const dataItem = [...itemFromBooking, ...itemFromStock];

      await StockOpnameRawMaterialItem.bulkCreate(dataItem, {
        transaction: t,
      });

      await t.commit();
      return { status_code: 200, success: true, message: "create success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  saveStockOpnameRawMaterialItemService: async ({
    id,
    jumlah_qty_real,
    note,
    id_user,
  }) => {
    const t = await db.transaction();

    try {
      const dataItem = await StockOpnameRawMaterialItem.findByPk(id, {
        transaction: t,
      });
      if (!dataItem) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Raw Material Item Tidak Ditemukan",
        };
      }

      let typeOpname = "";
      if (parseFloat(dataItem.jumlah_qty) == parseFloat(jumlah_qty_real)) {
        typeOpname = "sesuai";
      } else if (
        parseFloat(dataItem.jumlah_qty) > parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "kurang";
      } else if (
        parseFloat(dataItem.jumlah_qty) < parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "lebih";
      }

      await StockOpnameRawMaterialItem.update(
        {
          status: "saved",
          note: note || null,
          tgl_respon: new Date(),
          id_user_save: id_user,
          type_opname: typeOpname,
          jumlah_qty_real: jumlah_qty_real,
        },
        { where: { id }, transaction: t },
      );

      await t.commit();
      return { status_code: 200, success: true, message: "save success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  approveStockOpnameRawMaterialItemService: async ({
    id_list,
    note_approve,
    id_user,
  }) => {
    const t = await db.transaction();

    try {
      if (!Array.isArray(id_list) || id_list.length === 0) {
        await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "id_list harus berupa array dan tidak boleh kosong",
        };
      }

      const dataItem = await StockOpnameRawMaterialItem.findAll({
        where: { id: { [Op.in]: id_list } },
        transaction: t,
      });

      if (dataItem.length !== id_list.length) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message:
            "Beberapa Data StockOpname Raw Material Item Tidak Ditemukan",
        };
      }

      await StockOpnameRawMaterialItem.update(
        {
          status: "approved",
          note_approve: note_approve || null,
          id_user_approve: id_user,
        },
        { where: { id: { [Op.in]: id_list } }, transaction: t },
      );

      await t.commit();
      return { status_code: 200, success: true, message: "approve success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  rejectStockOpnameRawMaterialItemService: async ({
    id_list,
    note_reject,
    id_user,
  }) => {
    const t = await db.transaction();

    try {
      if (!Array.isArray(id_list) || id_list.length === 0) {
        await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "id_list harus berupa array dan tidak boleh kosong",
        };
      }

      const dataItem = await StockOpnameRawMaterialItem.findAll({
        where: { id: { [Op.in]: id_list } },
        transaction: t,
      });

      if (dataItem.length !== id_list.length) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message:
            "Beberapa Data StockOpname Raw Material Item Tidak Ditemukan",
        };
      }

      await StockOpnameRawMaterialItem.update(
        {
          status: "rejected",
          note_reject: note_reject || null,
          id_user_reject: id_user,
        },
        { where: { id: { [Op.in]: id_list } }, transaction: t },
      );

      await t.commit();
      return { status_code: 200, success: true, message: "reject success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  requestStockOpnameRawMaterialService: async ({ id }) => {
    const t = await db.transaction();

    try {
      const dataStockOpname = await StockOpnameRawMaterial.findByPk(id, {
        transaction: t,
      });
      if (!dataStockOpname) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Raw Material Tidak Ditemukan",
        };
      }

      await StockOpnameRawMaterial.update(
        { status_tiket: "requested", status: "requested" },
        { where: { id }, transaction: t },
      );

      await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "StockOpname Raw Material requested success",
      };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  approveStockOpnameRawMaterialService: async ({ id, id_user, tgl_mutasi }) => {
    const t = await db.transaction();

    try {
      const dataStockOpname = await StockOpnameRawMaterial.findByPk(id, {
        transaction: t,
      });
      if (!dataStockOpname) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Raw Material Tidak Ditemukan",
        };
      }

      await StockOpnameRawMaterial.update(
        {
          status: "history",
          status_tiket: "approved",
          tgl_approve: new Date(),
        },
        { where: { id }, transaction: t },
      );

      const dataItem = await StockOpnameRawMaterialItem.findAll({
        where: {
          id_stock_opname_raw_material: id,
          status: "approved",
          type_opname: { [Op.ne]: "sesuai" },
        },
        transaction: t,
      });

      for (const item of dataItem) {
        const jumlahQtyAwal = parseFloat(item.jumlah_qty);
        const jumlahQtyAktual = parseFloat(item.jumlah_qty_real);

        const qtyMutasiBarang =
          item.type_opname === "kurang"
            ? jumlahQtyAwal - jumlahQtyAktual
            : jumlahQtyAktual - jumlahQtyAwal;

        if (item.sumber_gudang === "booking") {
          const dataBooking = await GudangRawMaterialBooking.findByPk(
            item.id_gudang_raw_material_booking,
            { transaction: t },
          );

          if (!dataBooking) {
            throw {
              success: false,
              status_code: 404,
              message: `Data Gudang Raw Material Booking Tidak Ditemukan untuk StockOpname Item id ${item.id}`,
            };
          }

          const createMutasiBarang =
            await MutasiBarangRawMaterialService.creteMutasiBarangRawMaterialService(
              {
                id_item: dataBooking.id_item,
                id_user: id_user,
                id_jo_booking: dataBooking.id_jo,
                jumlah_qty: qtyMutasiBarang,
                type_mutasi: item.type_opname === "kurang" ? "keluar" : "masuk",
                sumber_mutasi: "stock opname",
                note: item.note || null,
                tgl_mutasi: tgl_mutasi || new Date(),
                transaction: t,
              },
            );

          if (createMutasiBarang.success === false) {
            throw {
              success: false,
              status_code: 400,
              message: createMutasiBarang.message,
            };
          }

          await GudangRawMaterialBooking.update(
            { qty: jumlahQtyAktual },
            { where: { id: dataBooking.id }, transaction: t },
          );
        } else if (item.sumber_gudang === "stock") {
          const dataStock = await GudangRawMaterialStock.findByPk(
            item.id_gudang_raw_material_stock,
            { transaction: t },
          );

          if (!dataStock) {
            throw {
              success: false,
              status_code: 404,
              message: `Data Gudang Raw Material Stock Tidak Ditemukan untuk StockOpname Item id ${item.id}`,
            };
          }

          const createMutasiBarang =
            await MutasiBarangRawMaterialService.creteMutasiBarangRawMaterialService(
              {
                id_item: dataStock.id_item,
                id_user: id_user,
                id_jo_booking: null,
                jumlah_qty: qtyMutasiBarang,
                type_mutasi: item.type_opname === "kurang" ? "keluar" : "masuk",
                sumber_mutasi: "stock opname",
                note: item.note || null,
                tgl_mutasi: tgl_mutasi || new Date(),
                transaction: t,
              },
            );

          if (createMutasiBarang.success === false) {
            throw {
              success: false,
              status_code: 400,
              message: createMutasiBarang.message,
            };
          }

          const createMutasiBarangStock =
            await MutasiBarangRawMaterialStockService.createMutasiGudangRawMaterialStockService(
              {
                id_gudang_raw_material_stock: dataStock.id,
                id_item: dataStock.id_item,
                id_user: id_user,
                id_jo_booking: null,
                jumlah_qty: qtyMutasiBarang,
                type_mutasi: item.type_opname === "kurang" ? "keluar" : "masuk",
                sumber_mutasi: "stock opname",
                note: item.note || null,
                tgl_mutasi: tgl_mutasi || new Date(),
                transaction: t,
              },
            );

          if (createMutasiBarangStock.success === false) {
            throw {
              success: false,
              status_code: 400,
              message: createMutasiBarangStock.message,
            };
          }

          let objUpdate = {
            qty: jumlahQtyAktual,
          };

          if (item.type_opname == "lebih")
            objUpdate.tgl_masuk = tgl_mutasi || new Date();

          await GudangRawMaterialStock.update(objUpdate, {
            where: { id: dataStock.id },
            transaction: t,
          });
        }
      }

      await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "StockOpname Raw Material approved success",
      };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },
  rejectStockOpnameRawMaterialService: async ({ id }) => {
    const t = await db.transaction();

    try {
      const dataStockOpname = await StockOpnameRawMaterial.findByPk(id, {
        transaction: t,
      });
      if (!dataStockOpname) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Raw Material Tidak Ditemukan",
        };
      }

      await StockOpnameRawMaterial.update(
        {
          status: "draft",
          status_tiket: "rejected",
          tgl_approve: new Date(),
        },
        { where: { id }, transaction: t },
      );

      await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "StockOpname Raw Material rejected success",
      };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  updateStockOpnameRawMaterialItemService: async ({
    id,
    jumlah_qty_real,
    note,
    id_user,
  }) => {
    const t = await db.transaction();

    try {
      const dataItem = await StockOpnameRawMaterialItem.findByPk(id, {
        transaction: t,
      });
      if (!dataItem) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Raw Material Item Tidak Ditemukan",
        };
      }

      let typeOpname = "";
      if (parseFloat(dataItem.jumlah_qty) == parseFloat(jumlah_qty_real)) {
        typeOpname = "sesuai";
      } else if (
        parseFloat(dataItem.jumlah_qty) > parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "kurang";
      } else if (
        parseFloat(dataItem.jumlah_qty) < parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "lebih";
      }

      await StockOpnameRawMaterialItem.update(
        {
          status: "saved",
          note: note || null,
          type_opname: typeOpname,
          jumlah_qty_real: jumlah_qty_real,
        },
        { where: { id }, transaction: t },
      );

      await t.commit();
      return { status_code: 200, success: true, message: "update success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = StockOpnameRawMaterialService;
