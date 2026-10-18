const { Op } = require("sequelize");
const GoodReceipt = require("../../../../model/akunting/goodReceipt/goodReceiptModel");
const InvoiceApModel = require("../../../../model/akunting/invoiceAp/invoiceApModel");
require("../../../../model/akunting/invoiceAp/invoiceApItemModel"); // registrasi relasi gr <-> invoice ap
const IncomingRawMaterial = require("../../../../model/qc/incomingRawMaterial/incomingRawMaterialModel");
const PurchaseOrder = require("../../../../model/purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItem = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemModel");
const PurchaseOrderItemJo = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemJoModel");
const PurchaseOrderBooking = require("../../../../model/purchasing/purchaseOrderBooking/purchaseOrderBookingModel");
const PurchaseOrderBookingItem = require("../../../../model/purchasing/purchaseOrderBooking/purchaseOrderBookingItemModel");
const Users = require("../../../../model/userModel");

const GoodReceiptService = {
  getGoodReceiptService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_vendor,
    id_invoice_ap,
    is_created_invoice,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const obj = { is_active: true };

    if (search) {
      obj[Op.or] = [
        { no_good_receipt: { [Op.like]: `%${search}%` } },
        { no_surat_jalan: { [Op.like]: `%${search}%` } },
        { no_purchase_order: { [Op.like]: `%${search}%` } },
        { nama_vendor: { [Op.like]: `%${search}%` } },
        { nama_item: { [Op.like]: `%${search}%` } },
      ];
    }
    if (id_vendor) obj.id_vendor = id_vendor;
    if (id_invoice_ap) obj.id_invoice_ap = id_invoice_ap;
    if (is_created_invoice === "true" || is_created_invoice === true) {
      obj.is_created_invoice = true;
    } else if (is_created_invoice === "false" || is_created_invoice === false) {
      obj.is_created_invoice = false;
    }

    // filter tgl approve incoming
    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_action = { [Op.between]: [startDate, endDate] };
    }

    try {
      if (page && limit) {
        const length = await GoodReceipt.count({ where: obj });
        const data = await GoodReceipt.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data,
          total_data: length,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await GoodReceipt.findByPk(id, {
          include: [
            { model: IncomingRawMaterial, as: "incoming_raw_material" },
            { model: PurchaseOrder, as: "purchase_order" },
            { model: PurchaseOrderItemJo, as: "purchase_order_item_jo" },
            { model: PurchaseOrderBooking, as: "purchase_order_booking" },
            {
              model: PurchaseOrderBookingItem,
              as: "purchase_order_booking_item",
            },
            { model: InvoiceApModel, as: "invoice_ap" },
            { model: Users, as: "user_request" },
            { model: Users, as: "user_approve" },
          ],
        });
        return { status: 200, success: true, data };
      } else {
        const data = await GoodReceipt.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return { status: 200, success: true, data };
      }
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  // dipanggil saat incoming raw material di approve (dalam transaksi approve)
  // data gr = data incoming + vendor, item & harga dari PO / PO booking
  createGoodReceiptFromIncomingService: async ({ id_incoming, transaction }) => {
    // 1 incoming = 1 gr, jangan dobel kalau approve terpanggil ulang
    const existing = await GoodReceipt.findOne({
      where: { id_incoming_raw_material: id_incoming, is_active: true },
      transaction,
    });
    if (existing) return existing;

    const dataIrm = await IncomingRawMaterial.findByPk(id_incoming, {
      include: [
        {
          model: PurchaseOrderItemJo,
          as: "purchase_order_item_jo",
          include: [{ model: PurchaseOrder, as: "purchase_order" }],
        },
        {
          model: PurchaseOrderBookingItem,
          as: "purchase_order_booking_item",
          include: [
            { model: PurchaseOrderBooking, as: "purchase_order_booking" },
          ],
        },
      ],
      transaction,
    });
    if (!dataIrm) {
      throw {
        status_code: 404,
        message: "Data Incoming Raw Material Tidak Ditemukan",
      };
    }

    let detail;
    if (dataIrm.id_purchase_order_booking_item) {
      const itemBooking = dataIrm.purchase_order_booking_item;
      const poBooking = itemBooking?.purchase_order_booking;
      detail = {
        id_purchase_order_booking:
          dataIrm.id_purchase_order_booking ||
          itemBooking?.id_purchase_order_booking ||
          null,
        id_vendor: poBooking?.id_vendor || null,
        nama_vendor: poBooking?.nama_vendor || null,
        no_purchase_order: poBooking?.no_purchase_order || null,
        id_item: itemBooking?.id_item || null,
        nama_item: itemBooking?.nama_item || null,
        tipe_barang: itemBooking?.tipe_barang || null,
        satuan: itemBooking?.satuan || null,
        harga: Number(itemBooking?.harga || 0),
        is_ppn: Boolean(itemBooking?.is_ppn),
      };
    } else {
      const itemJo = dataIrm.purchase_order_item_jo;
      const po = itemJo?.purchase_order;
      // harga ada di item PO (per id_item), item jo tidak menyimpan harga
      const itemPo = po
        ? await PurchaseOrderItem.findOne({
            where: { id_purchase_order: po.id, id_item: itemJo.id_item },
            order: [["is_active", "DESC"]],
            transaction,
          })
        : null;
      detail = {
        id_purchase_order:
          dataIrm.id_purchase_order || itemJo?.id_purchase_order || null,
        id_vendor: po?.id_vendor || null,
        nama_vendor: po?.nama_vendor || null,
        no_purchase_order: po?.no_purchase_order || null,
        id_item: itemJo?.id_item || null,
        nama_item: itemJo?.nama_item || null,
        tipe_barang: itemJo?.tipe_barang || null,
        satuan: itemJo?.satuan || null,
        harga: Number(itemPo?.harga || 0),
        is_ppn: Boolean(itemPo?.is_ppn),
      };
    }

    const qty = (dataIrm.qty_incoming || 0) + (dataIrm.qty_idle || 0);

    return GoodReceipt.create(
      {
        id_incoming_raw_material: dataIrm.id,
        id_purchase_order: null,
        id_purchase_order_item_jo: dataIrm.id_purchase_order_item_jo || null,
        id_purchase_order_booking: null,
        id_purchase_order_booking_item:
          dataIrm.id_purchase_order_booking_item || null,
        id_request: dataIrm.id_request,
        id_approve: dataIrm.id_approve,
        no_surat_jalan: dataIrm.no_surat_jalan,
        no_good_receipt: dataIrm.no_good_receipt,
        qty_incoming: dataIrm.qty_incoming || 0,
        qty_idle: dataIrm.qty_idle || 0,
        qty_pallet: dataIrm.qty_pallet || 0,
        tgl_request: dataIrm.tgl_request,
        tgl_action: dataIrm.tgl_action,
        note: dataIrm.note,
        ...detail,
        qty,
        total: Math.round(qty * detail.harga),
      },
      { transaction },
    );
  },
};

module.exports = GoodReceiptService;
