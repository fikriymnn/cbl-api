const db = require("../../../../config/database");
const { Op } = require("sequelize");
const OutstandingStockRawMaterial = require("../../../../model/gudangRM/outstandingStockRawMaterialModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const BomPpicModel = require("../../../../model/ppic/bomPpic/bomPpicModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../../model/userModel");
const GudangRawMaterialBookingService = require("../../gudangRawMaterialBooking/service/gudangRawMaterialBookingService");
const GudangRawMaterialStockService = require("../../gudangRawMaterialStock/service/gudangRawMaterialStockService");

// NOTE: sesuaikan path require di atas dengan lokasi file model kamu yang sebenarnya.

const OutstandingStockRawMaterialService = {
  // get hanya ambil data outstanding stock raw material nya saja
  // jika get by id -> include semua relasi
  getOutstandingStockRawMaterialService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_item,
    tipe_barang,
    status,
    status_ticket,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (search) {
      obj = {
        [Op.or]: [
          { no_jo: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
          { nama_item: { [Op.like]: `%${search}%` } },
          { no_bom_ppic: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (id_item) obj.id_item = id_item;
    if (tipe_barang) obj.tipe_barang = tipe_barang;
    if (status) obj.status = status;
    if (status_ticket) obj.status_ticket = status_ticket;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (id) {
        // get by id -> include semua relasi
        const data = await OutstandingStockRawMaterial.findByPk(id, {
          include: [
            {
              model: JobOrder,
              as: "job_order",
            },
            {
              model: SoModel,
              as: "so",
            },
            {
              model: IoModel,
              as: "io",
            },
            {
              model: BomPpicModel,
              as: "bom_ppic",
            },
            {
              model: MasterBarang,
              as: "master_barang",
            },
            {
              model: Users,
              as: "user_approve",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else if (page && limit) {
        const length = await OutstandingStockRawMaterial.count({ where: obj });
        const data = await OutstandingStockRawMaterial.findAll({
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
      } else {
        const data = await OutstandingStockRawMaterial.findAll({
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

  // create outstanding stock raw material
  // default status & status_ticket "incoming"
  createOutstandingStockRawMaterialService: async ({
    id_jo,
    id_so,
    id_io,
    id_bom_ppic,
    id_item,
    no_jo,
    no_bom_ppic,
    no_so,
    no_io,
    customer,
    produk,
    nama_item,
    qty,
    tipe_barang,
    satuan,
    rencana_cetak,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!id_item) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "id_item tidak boleh kosong",
        };
      }

      const dataItem = await MasterBarang.findByPk(id_item, {
        transaction: t,
      });
      if (!dataItem) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Barang Tidak Ditemukan",
        };
      }

      const newData = await OutstandingStockRawMaterial.create(
        {
          id_jo: id_jo || null,
          id_so: id_so || null,
          id_io: id_io || null,
          id_bom_ppic: id_bom_ppic || null,
          id_item,
          no_jo: no_jo || null,
          no_bom_ppic: no_bom_ppic || null,
          no_so: no_so || null,
          no_io: no_io || null,
          customer: customer || null,
          produk: produk || null,
          nama_item: nama_item || dataItem?.nama_barang || null,
          qty: qty || 0,
          tipe_barang: tipe_barang || null,
          satuan: satuan || null,
          rencana_cetak: rencana_cetak || null,
          tgl_masuk: new Date(),
          status: "incoming",
          status_ticket: "incoming",
          is_active: true,
        },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: { id: newData.id },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // approve outstanding stock raw material
  // update tgl_approve, id_user_approve, status jadi "approve", status_ticket jadi "history"
  approveOutstandingStockRawMaterialService: async ({
    id,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!id) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "id tidak boleh kosong",
        };
      }

      const existingData = await OutstandingStockRawMaterial.findOne({
        where: { id, is_active: true },
        transaction: t,
      });

      if (!existingData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Outstanding Stock Raw Material Tidak Ditemukan",
        };
      }

      await OutstandingStockRawMaterial.update(
        {
          tgl_approve: new Date(),
          id_user_approve: id_user || null,
          status: "approve",
          status_ticket: "history",
        },
        { where: { id }, transaction: t },
      );

      const createGudangBooking =
        await GudangRawMaterialBookingService.createGudangRawMaterialBookingService(
          {
            id_jo: existingData.id_jo,
            id_item: existingData.id_item,
            qty: existingData.qty,
            satuan: existingData.satuan,
            tipe_barang: existingData.tipe_barang,
            rencana_cetak: existingData.rencana_cetak,
            transaction: t,
          },
        );

      if (createGudangBooking.success === false) {
        throw {
          success: false,
          status_code: 400,
          message: createGudangBooking.message,
        };
      }

      const useGudangStock =
        await GudangRawMaterialStockService.useGudangRawMaterialStockService({
          id_item: existingData.id_item,
          qty: existingData.qty,
          sumber_mutasi: "booking jo",
          id_user: id_user,
          id_jo_booking: existingData.id_jo,
          no_jo_booking: existingData.no_jo_booking,
          transaction: t,
        });

      if (useGudangStock.success === false) {
        throw {
          success: false,
          status_code: 400,
          message: useGudangStock.message,
        };
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "approve success",
        data: { id },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = OutstandingStockRawMaterialService;
