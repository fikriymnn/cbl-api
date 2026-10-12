const db = require("../../../../config/database");
const { Op } = require("sequelize");
const PurchaseOrderBooking = require("../../../../model/purchasing/purchaseOrderBooking/purchaseOrderBookingModel");
const PurchaseOrderBookingItem = require("../../../../model/purchasing/purchaseOrderBooking/purchaseOrderBookingItemModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../../model/userModel");
const PurchaseOrderService = require("../../purchaseOrder/service/purchaseOrderService");

const includePurchaseOrderBooking = () => [
  {
    model: PurchaseOrderBookingItem,
    as: "items",
    where: { is_active: true },
    required: false,
    include: [
      {
        model: MasterBarang,
        as: "master_barang",
      },
    ],
  },
  {
    model: Users,
    as: "user_request",
  },
  {
    model: Users,
    as: "user_create",
  },
  {
    model: Users,
    as: "user_approve_kabag",
  },
  {
    model: Users,
    as: "user_approve_finance",
  },
  {
    model: Users,
    as: "user_reject_kabag",
  },
  {
    model: Users,
    as: "user_reject_finance",
  },
];

// hitung qty_beli, total, ppn per item
const buildItemPayload = (item) => {
  const qty_beli = item.qty_beli || item.qty || 0;
  const harga = item.harga || 0;
  const totalItem = qty_beli * harga;
  const ppnItem = item.is_ppn ? totalItem * 0.11 : 0;

  return {
    id_item: item.id_item || null,
    id_brand: item.id_brand || null,
    nama_item: item.nama_item || null,
    nama_brand: item.nama_brand || null,
    qty: item.qty || 0,
    qty_beli,
    tipe_barang: item.tipe_barang || null,
    satuan: item.satuan || null,
    harga,
    total: totalItem,
    ppn: ppnItem,
    is_ppn: item.is_ppn || false,
  };
};

const PurchaseOrderBookingService = {
  // nomor PO dipakai bersama dengan PO biasa
  getNoPurchaseOrderBookingService: async () => {
    try {
      const { last, next } =
        await PurchaseOrderService.generateNoPurchaseOrder();
      return {
        status: 200,
        success: true,
        no_purchase_order: last,
        no_purchase_order_new: next,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  getPurchaseOrderBookingService: async ({
    id,
    page,
    limit,
    start_date_po,
    end_date_po,
    start_date_kirim,
    end_date_kirim,
    search,
    id_vendor,
    status,
    status_tiket,
    status_po,
    sort_by,
    sort_order,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    const hasPagination = Boolean(page && limit);
    const hasId = Boolean(id);
    const hasPoDateRange = Boolean(start_date_po && end_date_po);
    const hasKirimDateRange = Boolean(start_date_kirim && end_date_kirim);
    const hasIncompletePagination = Boolean(page || limit) && !hasPagination;
    const hasIncompletePoDate =
      Boolean(start_date_po || end_date_po) && !hasPoDateRange;
    const hasIncompleteKirimDate =
      Boolean(start_date_kirim || end_date_kirim) && !hasKirimDateRange;

    // whitelist kolom yang boleh disort, hindari SQL injection lewat orderFilter
    const ALLOWED_SORT_COLUMNS = [
      "createdAt",
      "tgl_po",
      "tgl_kirim",
      "no_purchase_order",
    ];

    const direction =
      String(sort_order).toUpperCase() === "ASC" ? "ASC" : "DESC";

    // default order, bisa ditimpa oleh filter tanggal di bawah
    let orderFilter = [["createdAt", "DESC"]];

    if (search) {
      obj = {
        [Op.or]: [
          { no_purchase_order: { [Op.like]: `%${search}%` } },
          { nama_vendor: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (id_vendor) obj.id_vendor = id_vendor;
    if (status) obj.status = status;
    if (status_tiket) obj.status_tiket = status_tiket;
    if (status_po) obj.status_po = status_po;

    if (hasPoDateRange) {
      const startDate = new Date(start_date_po).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date_po).setHours(23, 59, 59, 999);
      obj.tgl_po = { [Op.between]: [startDate, endDate] };
      orderFilter = [["tgl_po", "DESC"]];
    }

    if (hasKirimDateRange) {
      const startDate = new Date(start_date_kirim).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date_kirim).setHours(23, 59, 59, 999);
      obj.tgl_kirim = { [Op.between]: [startDate, endDate] };
      orderFilter = [["tgl_kirim", "DESC"]];
    }

    // sort_by eksplisit selalu menang, terlepas dari ada/tidaknya filter tanggal
    if (sort_by && ALLOWED_SORT_COLUMNS.includes(sort_by)) {
      orderFilter = [[sort_by, direction]];
    }

    obj.is_active = true;
    try {
      if (hasIncompletePagination) {
        return {
          status: 400,
          success: false,
          message: "page dan limit harus diisi bersamaan",
        };
      }

      if (hasIncompletePoDate || hasIncompleteKirimDate) {
        return {
          status: 400,
          success: false,
          message:
            "Tanggal harus diisi berpasangan: start_date_po dan end_date_po, atau start_date_kirim dan end_date_kirim",
        };
      }

      if (!hasPagination && !hasId && !hasPoDateRange && !hasKirimDateRange) {
        return {
          status: 400,
          success: false,
          message:
            "Get semua Purchase Order Booking wajib mengisi range tanggal PO atau range tanggal kirim",
        };
      }

      if (hasPagination) {
        const length = await PurchaseOrderBooking.count({ where: obj });
        const data = await PurchaseOrderBooking.findAll({
          order: orderFilter,
          limit: parseInt(limit),
          offset,
          where: obj,
          include: includePurchaseOrderBooking(),
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (hasId) {
        const data = await PurchaseOrderBooking.findByPk(id, {
          include: includePurchaseOrderBooking(),
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await PurchaseOrderBooking.findAll({
          order: orderFilter,
          where: obj,
          include: includePurchaseOrderBooking(),
        });

        const rekap = calculatePurchaseOrderBookingRecap(data);

        return {
          status: 200,
          success: true,
          data: data,
          rekap,
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

  createPurchaseOrderBookingService: async ({
    id_create,
    id_vendor,
    nama_vendor,
    tgl_po,
    tgl_kirim,
    discount = 0,
    note_internal,
    note_supplier,
    purchase_name,
    items = [],
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!items || items.length === 0) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "Item Purchase Order Booking tidak boleh kosong",
        };
      }

      // 🔢 generate no purchase order otomatis (sequence sama dengan PO biasa)
      const { next: no_purchase_order } =
        await PurchaseOrderService.generateNoPurchaseOrder(t);

      let sub_total = 0;
      let total_ppn = 0;

      const itemsPayload = items.map((item) => {
        const payload = buildItemPayload(item);
        sub_total += payload.total;
        total_ppn += payload.ppn;
        return {
          ...payload,
          qty_terkirim: 0,
          qty_sisa: payload.qty_beli,
        };
      });

      const total = sub_total + total_ppn - (discount || 0);

      const newPo = await PurchaseOrderBooking.create(
        {
          id_create,
          no_purchase_order,
          id_vendor: id_vendor || null,
          nama_vendor: nama_vendor || null,
          tgl_po: tgl_po || new Date(),
          tgl_kirim: tgl_kirim || null,
          sub_total,
          discount: discount || 0,
          ppn: total_ppn,
          total,
          note_internal: note_internal || null,
          note_supplier: note_supplier || null,
          purchase_name: purchase_name || null,
          status: "draft",
          status_tiket: "draft",
        },
        { transaction: t },
      );

      await PurchaseOrderBookingItem.bulkCreate(
        itemsPayload.map((item) => ({
          ...item,
          id_purchase_order_booking: newPo.id,
        })),
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: newPo,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // update semua field kecuali field2 id user (id_create, id_request, id_approve_*, id_reject_*)
  updatePurchaseOrderBookingService: async ({
    id,
    id_vendor,
    nama_vendor,
    tgl_po,
    tgl_kirim,
    discount,
    note_internal,
    note_supplier,
    purchase_name,
    items = [],
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataPo = await PurchaseOrderBooking.findByPk(id, {
        transaction: t,
      });
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Booking Tidak Ditemukan",
        };
      }

      let sub_total = 0;
      let total_ppn = 0;
      const itemIdsToKeep = [];

      for (const item of items) {
        const itemPayload = {
          ...buildItemPayload(item),
          id_purchase_order_booking: id,
        };

        sub_total += itemPayload.total;
        total_ppn += itemPayload.ppn;

        if (item.id) {
          // update item lama, qty_sisa dihitung ulang dari qty yang sudah terkirim
          const existingItem = await PurchaseOrderBookingItem.findOne({
            where: { id: item.id, id_purchase_order_booking: id },
            transaction: t,
          });
          const qtyTerkirim = existingItem?.qty_terkirim || 0;

          await PurchaseOrderBookingItem.update(
            {
              ...itemPayload,
              qty_sisa: itemPayload.qty_beli - qtyTerkirim,
            },
            {
              where: { id: item.id, id_purchase_order_booking: id },
              transaction: t,
            },
          );
          itemIdsToKeep.push(item.id);
        } else {
          // item baru
          const newItem = await PurchaseOrderBookingItem.create(
            {
              ...itemPayload,
              qty_terkirim: 0,
              qty_sisa: itemPayload.qty_beli,
            },
            { transaction: t },
          );
          itemIdsToKeep.push(newItem.id);
        }
      }

      // nonaktifkan item lama yang sudah tidak ada di payload
      await PurchaseOrderBookingItem.update(
        { is_active: false },
        {
          where: {
            id_purchase_order_booking: id,
            id: { [Op.notIn]: itemIdsToKeep.length ? itemIdsToKeep : [0] },
          },
          transaction: t,
        },
      );

      const total = sub_total + total_ppn - (discount ?? dataPo.discount ?? 0);

      await PurchaseOrderBooking.update(
        {
          id_vendor: id_vendor ?? dataPo.id_vendor,
          nama_vendor: nama_vendor ?? dataPo.nama_vendor,
          tgl_po: tgl_po ?? dataPo.tgl_po,
          tgl_kirim: tgl_kirim ?? dataPo.tgl_kirim,
          sub_total,
          discount: discount ?? dataPo.discount,
          ppn: total_ppn,
          total,
          note_internal: note_internal ?? dataPo.note_internal,
          note_supplier: note_supplier ?? dataPo.note_supplier,
          purchase_name: purchase_name ?? dataPo.purchase_name,
        },
        { where: { id }, transaction: t },
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

  // ubah status & status_tiket jadi "request kabag"
  requestPurchaseOrderBookingService: async ({
    id,
    id_request,
    transaction = null,
  }) =>
    updateStatusPurchaseOrderBooking({
      id,
      payload: {
        id_request,
        status: "request kabag",
        status_tiket: "request kabag",
      },
      message: "request success",
      transaction,
    }),

  // kabag approve -> status & status_tiket jadi "request finance"
  approveKabagPurchaseOrderBookingService: async ({
    id,
    id_approve_kabag,
    transaction = null,
  }) =>
    updateStatusPurchaseOrderBooking({
      id,
      payload: {
        id_approve_kabag,
        status: "request finance",
        status_tiket: "request finance",
      },
      message: "approve kabag success",
      transaction,
    }),

  // finance approve -> status "approve finance", status_tiket "history"
  approveFinancePurchaseOrderBookingService: async ({
    id,
    id_approve_finance,
    transaction = null,
  }) =>
    updateStatusPurchaseOrderBooking({
      id,
      payload: {
        id_approve_finance,
        status: "approve finance",
        status_tiket: "history",
      },
      message: "approve finance success",
      transaction,
    }),

  // kabag reject -> status "reject kabag", status_tiket "draft"
  rejectKabagPurchaseOrderBookingService: async ({
    id,
    id_reject_kabag,
    transaction = null,
  }) =>
    updateStatusPurchaseOrderBooking({
      id,
      payload: {
        id_reject_kabag,
        status: "reject kabag",
        status_tiket: "draft",
      },
      message: "reject kabag success",
      transaction,
    }),

  // finance reject -> status "reject finance", status_tiket "draft"
  rejectFinancePurchaseOrderBookingService: async ({
    id,
    id_reject_finance,
    transaction = null,
  }) =>
    updateStatusPurchaseOrderBooking({
      id,
      payload: {
        id_reject_finance,
        status: "reject finance",
        status_tiket: "draft",
      },
      message: "reject finance success",
      transaction,
    }),

  closePurchaseOrderBookingService: async ({
    id,
    id_close_po,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const dataPo = await PurchaseOrderBooking.findByPk(id, {
        transaction: t,
      });
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Booking Tidak Ditemukan",
        };
      }

      await PurchaseOrderBooking.update(
        { id_close_po, status_po: "done" },
        { where: { id }, transaction: t },
      );

      await PurchaseOrderBookingItem.update(
        { status_po: "done" },
        { where: { id_purchase_order_booking: id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "close po success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

// dipakai untuk request / approve / reject yang cuma ubah status
const updateStatusPurchaseOrderBooking = async ({
  id,
  payload,
  message,
  transaction = null,
}) => {
  const t = transaction || (await db.transaction());
  try {
    const dataPo = await PurchaseOrderBooking.findByPk(id, { transaction: t });
    if (!dataPo) {
      if (!transaction) await t.rollback();
      return {
        status_code: 404,
        success: false,
        message: "Data Purchase Order Booking Tidak Ditemukan",
      };
    }

    await PurchaseOrderBooking.update(payload, {
      where: { id },
      transaction: t,
    });

    if (!transaction) await t.commit();
    return {
      status_code: 200,
      success: true,
      message,
    };
  } catch (error) {
    if (!transaction) await t.rollback();
    throw { success: false, message: error.message };
  }
};

/**
 * Aturan rekap Purchase Order Booking (sama seperti PO, tapi dari items):
 * 1. Hanya item berstatus "progress" dan "done" yang dihitung.
 * 2. Status "progress": total qty menggunakan qty_beli.
 * 3. Status "done": total qty menggunakan qty_terkirim dan OTS menjadi 0.
 * 4. Terkirim qty selalu menggunakan qty_terkirim.
 * 5. OTS qty = total qty - terkirim qty.
 * 6. Harga diambil langsung dari item.
 */
const calculatePurchaseOrderBookingRecap = (purchaseOrders) => {
  const rekap = {
    total_qty: 0,
    total_rupiah: 0,
    ots_qty: 0,
    ots_rupiah: 0,
    terkirim_qty: 0,
    terkirim_rupiah: 0,
  };

  purchaseOrders.forEach((purchaseOrder) => {
    (purchaseOrder.items || []).forEach((item) => {
      const qtyBeli = Number(item.qty_beli) || 0;
      const qtyTerkirim = Number(item.qty_terkirim) || 0;
      const harga = Number(item.harga) || 0;
      const statusPo = String(item.status_po).toLowerCase();

      if (statusPo !== "progress" && statusPo !== "done") return;

      const totalQty = statusPo === "done" ? qtyTerkirim : qtyBeli;
      const otsQty = totalQty - qtyTerkirim;

      rekap.total_qty += totalQty;
      rekap.total_rupiah += totalQty * harga;
      rekap.ots_qty += otsQty;
      rekap.ots_rupiah += otsQty * harga;
      rekap.terkirim_qty += qtyTerkirim;
      rekap.terkirim_rupiah += qtyTerkirim * harga;
    });
  });

  return rekap;
};

module.exports = PurchaseOrderBookingService;
