const db = require("../../../../config/database");
const { Op } = require("sequelize");
const StockOpname = require("../../../../model/finishGood/stockOpname/stockOpnameModel");
const StockOpnameItem = require("../../../../model/finishGood/stockOpname/stockOpnameItemModel");
const GudangFinishGood = require("../../../../model/finishGood/gudangFinishGoodModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const KalkulasiModel = require("../../../../model/marketing/kalkulasi/kalkulasiModel");
const MutasiBarangFinishGoodService = require("../../mutasiBarangFinishGood/service/mutasiBarangFinishGoodService");
const Users = require("../../../../model/userModel");

const StockOpnameService = {
  getStockOpnameService: async ({
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

    // if (search) {
    //   obj = {
    //     [Op.or]: [{ no_StockOpname: { [Op.like]: `%${search}%` } }],
    //   };
    // }
    if (status) obj.status = status;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_create = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (id) {
        const data = await StockOpname.findByPk(id, {
          include: [
            {
              model: StockOpnameItem,
              as: "stock_opname_item",
              include: [
                { model: Users, as: "user_save" },
                { model: Users, as: "user_approve" },
                { model: Users, as: "user_reject" },
              ],
            },
          ],
        });

        if (!data) {
          return {
            status: 404,
            success: false,
            message: "Data Stock Opname Tidak Ditemukan",
          };
        }

        return { status: 200, success: true, data };
      } else if (page && limit) {
        const length = await StockOpname.count({ where: obj });
        const data = await StockOpname.findAll({
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
        const data = await StockOpname.findAll({
          order: [["tgl_create", "DESC"]],
          where: obj,
        });
        return { status: 200, success: true, data };
      }
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  // id_gudang_finish_good: array of id
  createStockOpnameService: async ({ period_from, period_to, id_user }) => {
    const t = await db.transaction();

    try {
      if (!period_from || !period_to) {
        await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "period_from dan period_to tidak boleh kosong",
        };
      }

      const dataStockOpname = await StockOpname.create(
        {
          id_user_create: id_user,
          period_from: period_from,
          period_to: period_to,
          tgl_create: new Date(),
          status: "draft",
        },
        { transaction: t },
      );

      const dataGudangFinishGood = await GudangFinishGood.findAll({
        where: {
          is_active: true,
          status: "keep",
        },
        transaction: t,
      });

      let dataItem = dataGudangFinishGood.map((item) => {
        return {
          id_stock_opname: dataStockOpname.id,
          id_gudang_finish_good: item.id,
          id_jo: item.id_jo,
          id_io: item.id_io,
          id_so: item.id_so,
          id_customer: item.id_customer,
          id_produk: item.id_produk,
          no_jo: item.no_jo,
          no_io: item.no_io,
          no_so: item.no_so,
          no_po_customer: item.no_po_customer,
          customer: item.customer,
          produk: item.produk,
          po_qty: item.po_qty,
          jumlah_qty: item.jumlah_qty,
          tgl_masuk: item.tgl_masuk,
        };
      });

      await StockOpnameItem.bulkCreate(dataItem, { transaction: t });

      await t.commit();
      return { status_code: 200, success: true, message: "create success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  saveStockOpnameItemService: async ({
    id,
    jumlah_qty_real,
    note,
    id_user,
  }) => {
    const t = await db.transaction();

    try {
      const dataStockOpnameItem = await StockOpnameItem.findByPk(id, {
        transaction: t,
      });
      if (!dataStockOpnameItem) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Item Tidak Ditemukan",
        };
      }

      let typeOpname = "";
      if (
        parseFloat(dataStockOpnameItem.jumlah_qty) ==
        parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "sesuai";
      } else if (
        parseFloat(dataStockOpnameItem.jumlah_qty) > parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "kurang";
      } else if (
        parseFloat(dataStockOpnameItem.jumlah_qty) < parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "lebih";
      }

      await StockOpnameItem.update(
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

  approveStockOpnameItemService: async ({ id_list, note_approve, id_user }) => {
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

      const dataStockOpnameItem = await StockOpnameItem.findAll({
        where: { id: { [Op.in]: id_list } },
        transaction: t,
      });

      if (dataStockOpnameItem.length !== id_list.length) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Beberapa Data StockOpname Item Tidak Ditemukan",
        };
      }

      await StockOpnameItem.update(
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

  rejectStockOpnameItemService: async ({ id_list, note_reject, id_user }) => {
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

      const dataStockOpnameItem = await StockOpnameItem.findAll({
        where: { id: { [Op.in]: id_list } },
        transaction: t,
      });

      if (dataStockOpnameItem.length !== id_list.length) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Beberapa Data StockOpname Item Tidak Ditemukan",
        };
      }

      await StockOpnameItem.update(
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
  requestStockOpnameService: async ({ id }) => {
    const t = await db.transaction();

    try {
      const dataStockOpname = await StockOpname.findByPk(id, {
        transaction: t,
      });
      if (!dataStockOpname) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Tidak Ditemukan",
        };
      }

      await StockOpname.update(
        { status_tiket: "requested", status: "requested" },
        { where: { id }, transaction: t },
      );

      await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "StockOpname requested success",
      };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  approveStockOpnameService: async ({ id, id_user, tgl_mutasi }) => {
    const t = await db.transaction();

    try {
      const dataStockOpname = await StockOpname.findByPk(id, {
        transaction: t,
      });
      if (!dataStockOpname) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Tidak Ditemukan",
        };
      }

      await StockOpname.update(
        {
          status: "history",
          status_tiket: "approved",
          tgl_approve: new Date(),
        },
        { where: { id }, transaction: t },
      );

      const dataStockOpnameItem = await StockOpnameItem.findAll({
        where: {
          id_stock_opname: id,
          status: "approved",
          type_opname: { [Op.ne]: "sesuai" },
        },
        transaction: t,
      });

      for (const item of dataStockOpnameItem) {
        const dataGudangFg = await GudangFinishGood.findByPk(
          item.id_gudang_finish_good,
          { transaction: t },
        );

        if (!dataGudangFg) {
          throw {
            success: false,
            status_code: 404,
            message: `Data Gudang FG Tidak Ditemukan untuk StockOpname Item id ${item.id}`,
          };
        }

        const jumlahQtyAwal = parseFloat(item.jumlah_qty);
        const jumlahQtyAktual = parseFloat(item.jumlah_qty_real);

        const qtyMutasiBarang =
          item.type_opname === "kurang"
            ? jumlahQtyAwal - jumlahQtyAktual
            : jumlahQtyAktual - jumlahQtyAwal;

        const createMutasiBarang =
          await MutasiBarangFinishGoodService.creteMutasiBarangFinishGoodService(
            {
              id_customer: dataGudangFg.id_customer,
              id_io: dataGudangFg.id_io,
              id_jo: dataGudangFg.id_jo,
              id_produk: dataGudangFg.id_produk,
              id_so: dataGudangFg.id_so,
              id_user: id_user,
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

        await GudangFinishGood.update(
          { jumlah_qty: jumlahQtyAktual },
          { where: { id: dataGudangFg.id }, transaction: t },
        );
      }

      await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "StockOpname approved success",
      };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  rejectStockOpnameService: async ({ id }) => {
    const t = await db.transaction();

    try {
      const dataStockOpname = await StockOpname.findByPk(id, {
        transaction: t,
      });
      if (!dataStockOpname) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Tidak Ditemukan",
        };
      }

      await StockOpname.update(
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
        message: "StockOpname rejected success",
      };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },
  updateStockOpnameItemService: async ({
    id,
    jumlah_qty_real,
    note,
    id_user,
  }) => {
    const t = await db.transaction();

    try {
      const dataStockOpnameItem = await StockOpnameItem.findByPk(id, {
        transaction: t,
      });
      if (!dataStockOpnameItem) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data StockOpname Item Tidak Ditemukan",
        };
      }

      let typeOpname = "";
      if (
        parseFloat(dataStockOpnameItem.jumlah_qty) ==
        parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "sesuai";
      } else if (
        parseFloat(dataStockOpnameItem.jumlah_qty) > parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "kurang";
      } else if (
        parseFloat(dataStockOpnameItem.jumlah_qty) < parseFloat(jumlah_qty_real)
      ) {
        typeOpname = "lebih";
      }

      await StockOpnameItem.update(
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

module.exports = StockOpnameService;
