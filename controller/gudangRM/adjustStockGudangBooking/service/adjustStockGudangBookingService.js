const db = require("../../../../config/database");
const { Op, Sequelize } = require("sequelize");
const AdjustStockGudangBooking = require("../../../../model/gudangRM/adjustStockGudangBookingModel");
const GudangRawmaterialBooking = require("../../../../model/gudangRM/gudangRawMaterialBookingModel");
const Users = require("../../../../model/userModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const MasterCustomer = require("../../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const MutasiBarangRawMaterialService = require("../../../gudangRM/mutasiBarangRawMaterial/service/mutasiBarangRawMaterialService");

const AdjustStockRawMaterialBookingService = {
  getAdjustStockRawMaterialBookingService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_gudang_raw_material_booking,
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    id_item,
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
          { nama_item: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (id_gudang_raw_material_booking)
      obj.id_gudang_raw_material_booking = id_gudang_raw_material_booking;
    if (id_jo) obj.id_jo = id_jo;
    if (id_item) obj.id_item = id_item;
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
        const length = await AdjustStockGudangBooking.count({ where: obj });
        const data = await AdjustStockGudangBooking.findAll({
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
        const data = await AdjustStockGudangBooking.findByPk(id, {
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
        const data = await AdjustStockGudangBooking.findAll({
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

  createAdjustStockRawMaterialBookingService: async ({
    id_gudang_raw_material_booking,
    jumlah_qty_awal,
    jumlah_qty_adjust,
    note,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek data gudang raw material booking, sisa data (jo, io, so, customer, produk, dll) diambil dari sini
      const dataGudangRmBooking = await GudangRawmaterialBooking.findByPk(
        id_gudang_raw_material_booking,
        {
          include: [
            {
              model: JobOrder,
              as: "job_order",
            },
          ],
        },
      );
      if (!dataGudangRmBooking) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Gudang Raw Material Booking Tidak Ditemukan",
        };
      }

      const status =
        parseFloat(jumlah_qty_awal) > parseFloat(jumlah_qty_adjust)
          ? "pengurangan"
          : "penambahan";

      await AdjustStockGudangBooking.create(
        {
          id_gudang_raw_material_booking: dataGudangRmBooking.id,
          id_jo: dataGudangRmBooking.id_jo,
          id_item: dataGudangRmBooking.id_item,
          id_io: dataGudangRmBooking.job_order.id_io,
          id_so: dataGudangRmBooking.job_order.id_so,
          id_customer: dataGudangRmBooking.job_order.id_customer,
          id_produk: dataGudangRmBooking.job_order.id_produk,
          id_user: id_user,
          nama_item: dataGudangRmBooking.nama_item,
          no_jo: dataGudangRmBooking.no_jo,
          no_io: dataGudangRmBooking.job_order.no_io,
          no_so: dataGudangRmBooking.job_order.no_so,
          customer: dataGudangRmBooking.customer,
          produk: dataGudangRmBooking.produk,
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
            id_item: dataGudangRmBooking.id_item,
            id_user: id_user,
            id_jo_booking: dataGudangRmBooking.id_jo,
            tgl_mutasi: new Date(),
            jumlah_qty: qtyMutasiBarang,
            type_mutasi: status === "pengurangan" ? "keluar" : "masuk",
            sumber_mutasi: "adjust stock gudang booking",
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

      await GudangRawmaterialBooking.update(
        {
          qty: jumlah_qty_adjust,
        },
        {
          where: { id: dataGudangRmBooking.id },
          transaction: t,
        },
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

  updateAdjustStockRawMaterialBookingService: async ({
    id,
    jumlah_qty_awal,
    jumlah_qty_adjust,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek data adjust stock
      const dataAdjustStock = await AdjustStockGudangBooking.findByPk(id);
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

      await AdjustStockGudangBooking.update(
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

module.exports = AdjustStockRawMaterialBookingService;
