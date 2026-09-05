const db = require("../../../../config/database");
const { Op } = require("sequelize");
const RequestCancelPurchaseOrder = require("../../../../model/purchasing/requestCancelPurchaseOrder/requestCancelPurchaseOrderModel");
const PurchaseOrder = require("../../../../model/purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItemJo = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemJoModel");
const Users = require("../../../../model/userModel");

const RequestCancelPurchaseOrderService = {
  getRequestCancelPurchaseOrderService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_purchase_order,
    status,
    status_ticket,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (search) {
      obj = {
        [Op.or]: [
          { no_purchase_order: { [Op.like]: `%${search}%` } },
          { nama_vendor: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (id_purchase_order) obj.id_purchase_order = id_purchase_order;
    if (status) obj.status = status;
    if (status_ticket) obj.status_ticket = status_ticket;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    const includeModel = [
      {
        model: PurchaseOrder,
        as: "purchase_order",
      },
      {
        model: Users,
        as: "user_request",
      },
      {
        model: Users,
        as: "user_respon",
      },
    ];

    try {
      if (page && limit) {
        const length = await RequestCancelPurchaseOrder.count({ where: obj });
        const data = await RequestCancelPurchaseOrder.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: includeModel,
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await RequestCancelPurchaseOrder.findByPk(id, {
          include: includeModel,
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await RequestCancelPurchaseOrder.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: includeModel,
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

  // hanya menerima id_purchase_order & note dari user, field lain (no_purchase_order,
  // nama_vendor, tgl_po, tgl_kirim, sub_total, discount, ppn, total) disalin dari data PurchaseOrder
  createRequestCancelPurchaseOrderService: async ({
    id_purchase_order,
    note,
    id_request,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataPo = await PurchaseOrder.findByPk(id_purchase_order);
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Tidak Ditemukan",
        };
      }

      const newData = await RequestCancelPurchaseOrder.create(
        {
          id_purchase_order,
          id_request,
          no_purchase_order: dataPo.no_purchase_order,
          nama_vendor: dataPo.nama_vendor,
          tgl_po: dataPo.tgl_po,
          tgl_kirim: dataPo.tgl_kirim,
          sub_total: dataPo.sub_total,
          discount: dataPo.discount,
          ppn: dataPo.ppn,
          total: dataPo.total,
          note: note || null,
          status: "incoming",
          status_ticket: "incoming",
          is_active: true,
        },
        { transaction: t },
      );

      // ubah status_po di purchase order jadi "request cancel"
      await PurchaseOrder.update(
        { status_po: "request cancel" },
        { where: { id: id_purchase_order }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: newData,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // approve: request cancel disetujui -> PO benar-benar dibatalkan
  approveRequestCancelPurchaseOrderService: async ({
    id,
    id_respon,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataRequest = await RequestCancelPurchaseOrder.findByPk(id);
      if (!dataRequest) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Request Cancel Purchase Order Tidak Ditemukan",
        };
      }

      await RequestCancelPurchaseOrder.update(
        {
          id_respon,
          status: "approve",
          status_ticket: "history",
        },
        { where: { id }, transaction: t },
      );

      // PO jadi cancel
      await PurchaseOrder.update(
        { status_po: "cancel" },
        { where: { id: dataRequest.id_purchase_order }, transaction: t },
      );

      // semua item jo di PO tsb ikut cancel
      await PurchaseOrderItemJo.update(
        { status_po: "cancel" },
        {
          where: { id_purchase_order: dataRequest.id_purchase_order },
          transaction: t,
        },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "approve success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // reject: request cancel ditolak -> PO kembali berjalan normal (progress)
  rejectRequestCancelPurchaseOrderService: async ({
    id,
    id_respon,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataRequest = await RequestCancelPurchaseOrder.findByPk(id);
      if (!dataRequest) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Request Cancel Purchase Order Tidak Ditemukan",
        };
      }

      await RequestCancelPurchaseOrder.update(
        {
          id_respon,
          status: "reject",
          status_ticket: "history",
        },
        { where: { id }, transaction: t },
      );

      // PO kembali ke status_po "progress"
      await PurchaseOrder.update(
        { status_po: "progress" },
        { where: { id: dataRequest.id_purchase_order }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = RequestCancelPurchaseOrderService;
