const db = require("../../../../config/database");
const { Op, Sequelize } = require("sequelize");
const AdjustStock = require("../../../../model/finishGood/adjustStockModel");
const GudangFinishGood = require("../../../../model/finishGood/gudangFinishGoodModel");
const Users = require("../../../../model/userModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const MasterCustomer = require("../../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const MutasiBarangFinishGoodService = require("../../mutasiBarangFinishGood/service/mutasiBarangFinishGoodService");

const AdjustStockService = {
  getAdjustStockService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_gudang_finish_good,
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { no_jo: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (id_gudang_finish_good)
      obj.id_gudang_finish_good = id_gudang_finish_good;
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (page && limit) {
        const length = await AdjustStock.count({ where: obj });
        const data = await AdjustStock.findAll({
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
        const data = await AdjustStock.findByPk(id, {
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
        const data = await AdjustStock.findAll({
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

  createAdjustStockService: async ({
    id_gudang_finish_good,
    jumlah_qty_awal,
    jumlah_qty_adjust,
    note,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek data gudang fg, sisa data (jo, io, so, customer, produk, dll) diambil dari sini
      const dataGudangFg = await GudangFinishGood.findByPk(
        id_gudang_finish_good
      );
      if (!dataGudangFg) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Gudang FG Tidak Ditemukan",
        };
      }

      const status =
        parseFloat(jumlah_qty_awal) > parseFloat(jumlah_qty_adjust)
          ? "pengurangan"
          : "penambahan";

      await AdjustStock.create(
        {
          id_gudang_finish_good: dataGudangFg.id,
          id_jo: dataGudangFg.id_jo,
          id_io: dataGudangFg.id_io,
          id_so: dataGudangFg.id_so,
          id_customer: dataGudangFg.id_customer,
          id_produk: dataGudangFg.id_produk,
          id_user: id_user,
          no_jo: dataGudangFg.no_jo,
          no_io: dataGudangFg.no_io,
          no_so: dataGudangFg.no_so,
          no_po_customer: dataGudangFg.no_po_customer,
          customer: dataGudangFg.customer,
          produk: dataGudangFg.produk,
          po_qty: dataGudangFg.po_qty,
          jumlah_qty_awal: jumlah_qty_awal,
          jumlah_qty_adjust: jumlah_qty_adjust,
          tgl_adjust: new Date(),
          status: status,
          note: note || null,
        },
        { transaction: t }
      );

      const qtyMutasiBarang =
        status === "pengurangan"
          ? jumlah_qty_awal - jumlah_qty_adjust
          : jumlah_qty_adjust - jumlah_qty_awal;

      const createMutasiBarang =
        await MutasiBarangFinishGoodService.creteMutasiBarangFinishGoodService({
          id_customer: dataGudangFg.id_customer,
          id_io: dataGudangFg.id_io,
          id_jo: dataGudangFg.id_jo,
          id_produk: dataGudangFg.id_produk,
          id_so: dataGudangFg.id_so,
          id_user: id_user,
          jumlah_qty: qtyMutasiBarang,
          type_mutasi: status === "pengurangan" ? "keluar" : "masuk",
          sumber_mutasi: "adjust stock",
          note: note || null,
          transaction: t,
        });

      if (createMutasiBarang.success === false) {
        await t.rollback();

        throw {
          succes: false,
          status_code: 400,
          message: createMutasiBarang.message,
        };
      }

      await GudangFinishGood.update(
        {
          jumlah_qty: jumlah_qty_adjust,
        },
        {
          where: { id: dataGudangFg.id },
          transaction: t,
        }
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

  updateAdjustStockService: async ({
    id,
    jumlah_qty_awal,
    jumlah_qty_adjust,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek data adjust stock
      const dataAdjustStock = await AdjustStock.findByPk(id);
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

      await AdjustStock.update(
        {
          jumlah_qty_awal: qtyAwal,
          jumlah_qty_adjust: qtyAdjust,
          status: status,
          note: note !== undefined ? note : dataAdjustStock.note,
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
};

module.exports = AdjustStockService;
