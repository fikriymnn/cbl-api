const db = require("../../../../config/database");
const { Op, Sequelize, literal } = require("sequelize");
const PurchaseOrder = require("../../../../model/purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItem = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemModel");
const PurchaseOrderItemJo = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemJoModel");
const PurchaseOrderBooking = require("../../../../model/purchasing/purchaseOrderBooking/purchaseOrderBookingModel");
const PurchaseOrderBookingItem = require("../../../../model/purchasing/purchaseOrderBooking/purchaseOrderBookingItemModel");
const GudangRawMaterialBookingService = require("../../../gudangRM/gudangRawMaterialBooking/service/gudangRawMaterialBookingService");
const GudangRawMaterialStockService = require("../../../gudangRM/gudangRawMaterialStock/service/gudangRawMaterialStockService");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const BomPpicModel = require("../../../../model/ppic/bomPpic/bomPpicModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const MasterVendor = require("../../../../model/masterData/marketing/masterVendorModel");
const Users = require("../../../../model/userModel");
const RequestPurchase = require("../../../../model/purchasing/requestPurchase/requestPurchaseModel");

const PurchaseOrderService = {
  // 🔢 generate nomor PO berikutnya, format: 0713/CBL/072026
  // nomor urut dipakai bersama PO biasa & PO booking, jadi ambil yang terbesar dari kedua tabel
  generateNoPurchaseOrder: async (transaction = null) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const findLast = (Model) =>
      Model.findOne({
        where: {
          createdAt: { [Op.between]: [startOfYear, endOfYear] },
        },
        order: [
          [
            literal(
              `CAST(SUBSTRING_INDEX(no_purchase_order, '/', 1) AS UNSIGNED)`,
            ),
            "DESC",
          ],
          ["createdAt", "DESC"],
        ],
        transaction,
      });

    // contoh: "0713/CBL/072026" -> 713
    const getSeq = (data) => {
      const lastNo = data?.no_purchase_order;
      if (!lastNo) return 0;
      return parseInt(lastNo.substring(0, lastNo.indexOf("/")), 10) || 0;
    };

    const [lastPo, lastPoBooking] = await Promise.all([
      findLast(PurchaseOrder),
      findLast(PurchaseOrderBooking),
    ]);
    const lastData = getSeq(lastPoBooking) > getSeq(lastPo) ? lastPoBooking : lastPo;

    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

    const nextNumber = getSeq(lastData) + 1;

    const paddedNumber = String(nextNumber).padStart(4, "0");
    const newNo = `${paddedNumber}/CBL/${currentMonth}${currentYear}`;

    return {
      last: lastData?.no_purchase_order || null,
      next: newNo,
    };
  },

  // endpoint terpisah untuk preview nomor PO berikutnya
  getNoPurchaseOrderService: async () => {
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

  getPurchaseOrderService: async ({
    id,
    page,
    limit,
    start_date_po,
    end_date_po,
    start_date_kirim,
    end_date_kirim,
    search,
    id_jo,
    id_io,
    id_so,
    id_vendor,
    id_bom_ppic,
    status,
    status_tiket,
    status_po,
    sort_by, // <-- baru: nama kolom, mis. "tgl_kirim", "tgl_po", "createdAt"
    sort_order, // <-- baru: "ASC" | "DESC", default DESC
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
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_vendor) obj.id_vendor = id_vendor;
    if (id_bom_ppic) obj.id_bom_ppic = id_bom_ppic;
    if (status) obj.status = status;
    if (status_tiket) obj.status_tiket = status_tiket;
    if (status_po) obj.status_po = status_po;

    if (start_date_po && end_date_po) {
      const startDate = new Date(start_date_po).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date_po).setHours(23, 59, 59, 999);
      obj.tgl_po = { [Op.between]: [startDate, endDate] };
      orderFilter = [["tgl_po", "DESC"]];
    }

    if (start_date_kirim && end_date_kirim) {
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
            "Get semua Purchase Order wajib mengisi range tanggal PO atau range tanggal kirim",
        };
      }

      if (page && limit) {
        const length = await PurchaseOrder.count({ where: obj });
        const data = await PurchaseOrder.findAll({
          order: orderFilter,
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: PurchaseOrderItem,
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
              model: PurchaseOrderItemJo,
              as: "items_jo",
              where: { is_active: true },
              required: false,
              include: [
                {
                  model: PurchaseOrderBooking,
                  as: "purchase_order_booking",
                  attributes: ["id", "no_purchase_order", "nama_vendor"],
                },
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
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await PurchaseOrder.findByPk(id, {
          include: [
            {
              model: PurchaseOrderItem,
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
              model: PurchaseOrderItemJo,
              as: "items_jo",
              where: { is_active: true },
              required: false,
              include: [
                {
                  model: PurchaseOrderBooking,
                  as: "purchase_order_booking",
                  attributes: ["id", "no_purchase_order", "nama_vendor"],
                },
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
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await PurchaseOrder.findAll({
          order: orderFilter,
          where: obj,
          include: [
            {
              model: PurchaseOrderItem,
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
              model: PurchaseOrderItemJo,
              as: "items_jo",
              where: { is_active: true },
              required: false,
              include: [
                {
                  model: PurchaseOrderBooking,
                  as: "purchase_order_booking",
                  attributes: ["id", "no_purchase_order", "nama_vendor"],
                },
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
          ],
        });

        const rekap = calculatePurchaseOrderRecap(data);

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

  createPurchaseOrderService: async ({
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
    items_jo = [],
    request_purchase_data = [],
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!items || items.length === 0) {
        return {
          status_code: 400,
          success: false,
          message: "Item Purchase Order tidak boleh kosong",
        };
      }

      if (!request_purchase_data || request_purchase_data.length === 0) {
        return {
          status_code: 400,
          success: false,
          message: "request_purchase_data tidak boleh kosong",
        };
      }

      // 🔢 generate no purchase order otomatis
      const { next: no_purchase_order } =
        await PurchaseOrderService.generateNoPurchaseOrder(t);

      let sub_total = 0;
      let total_ppn = 0;

      const itemsPayload = items.map((item) => {
        const qty_beli = Number(item.qty_beli ?? item.qty) || 0;
        const harga = Number(item.harga) || 0;
        const totalItem = qty_beli * harga;
        const ppnItem = item.is_ppn ? totalItem * 0.11 : 0;

        sub_total += totalItem;
        total_ppn += ppnItem;

        return {
          id_item: item.id_item || null,
          id_brand: item.id_brand || null,
          nama_item: item.nama_item || null,
          nama_brand: item.nama_brand || null,
          purchase_name: purchase_name || null,
          qty: item.qty || 0,
          qty_beli,
          tipe_barang: item.tipe_barang || null,
          satuan: item.satuan || null,
          harga,
          total: totalItem,
          ppn: ppnItem,
          is_ppn: item.is_ppn || false,
        };
      });

      // item jo bisa ambil sebagian qty dari PO booking (qty_booking), langsung di-reserve ke qty_pakai
      const itemsJoPayload = [];
      for (const item of items_jo) {
        const booking = await reserveBookingQty(item, t);
        itemsJoPayload.push({ ...buildItemJoPayload(item), ...booking });
      }

      const total = sub_total + total_ppn - (discount || 0);

      const newPo = await PurchaseOrder.create(
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
          status: "draft",
          status_tiket: "draft",
        },
        { transaction: t },
      );

      const itemsWithPoId = itemsPayload.map((item) => ({
        ...item,
        id_purchase_order: newPo.id,
      }));

      const itemsJoWithPoId = itemsJoPayload.map((item) => ({
        ...item,
        id_purchase_order: newPo.id,
      }));

      await PurchaseOrderItem.bulkCreate(itemsWithPoId, { transaction: t });
      await PurchaseOrderItemJo.bulkCreate(itemsJoWithPoId, { transaction: t });

      for (let i = 0; i < request_purchase_data.length; i++) {
        const element = request_purchase_data[i];
        await RequestPurchase.update(
          { id_purchase_order: newPo.id, status: "history" },
          { where: { id: element.id }, transaction: t },
        );
      }

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

  // update semua field kecuali field2 id (id_jo, id_io, id_so, id_bom_ppic, id_create, id_request, id_approve_*, id_reject_*)
  updatePurchaseOrderService: async ({
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
    items_jo = [],
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataPo = await PurchaseOrder.findByPk(id);
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Tidak Ditemukan",
        };
      }

      let sub_total = 0;
      let total_ppn = 0;
      const itemIdsToKeep = [];
      const itemJoIdsToKeep = [];

      // untuk item
      for (const item of items) {
        const qty_beli = Number(item.qty_beli ?? item.qty) || 0;
        const harga = Number(item.harga) || 0;
        const totalItem = qty_beli * harga;
        const ppnItem = item.is_ppn ? totalItem * 0.11 : 0;

        sub_total += totalItem;
        total_ppn += ppnItem;

        const itemPayload = {
          id_purchase_order: id,
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

        if (item.id) {
          // update item lama
          await PurchaseOrderItem.update(itemPayload, {
            where: { id: item.id, id_purchase_order: id },
            transaction: t,
          });
          itemIdsToKeep.push(item.id);
        } else {
          // item baru
          const newItem = await PurchaseOrderItem.create(itemPayload, {
            transaction: t,
          });
          itemIdsToKeep.push(newItem.id);
        }
      }

      // untuk item jo
      // reserve qty booking lama dilepas dulu, lalu di-reserve ulang sesuai payload.
      // item jo yang qty booking-nya sudah dipindah ke gudang (approve finance) tidak boleh diubah / dihapus
      const existingItemJo = await PurchaseOrderItemJo.findAll({
        where: { id_purchase_order: id, is_active: true },
        transaction: t,
      });
      const existingItemJoById = new Map(
        existingItemJo.map((itemJo) => [String(itemJo.id), itemJo]),
      );
      const payloadItemJoIds = new Set(
        items_jo.filter((item) => item.id).map((item) => String(item.id)),
      );

      for (const itemJo of existingItemJo) {
        if (itemJo.is_booking_moved) {
          if (!payloadItemJoIds.has(String(itemJo.id))) {
            throw {
              message: `item jo ${itemJo.no_jo} - ${itemJo.nama_item} sudah ambil qty dari PO booking dan sudah masuk gudang, tidak bisa dihapus`,
            };
          }
          continue;
        }
        await releaseBookingQty(itemJo, t);
      }

      for (const item of items_jo) {
        const existing = item.id
          ? existingItemJoById.get(String(item.id))
          : null;

        let booking;
        if (existing?.is_booking_moved) {
          const isBookingChanged =
            String(item.id_purchase_order_booking_item || "") !==
              String(existing.id_purchase_order_booking_item || "") ||
            (Number(item.qty_booking) || 0) !==
              (Number(existing.qty_booking) || 0);
          if (isBookingChanged) {
            throw {
              message: `qty booking item jo ${existing.no_jo} - ${existing.nama_item} sudah masuk gudang, tidak bisa diubah`,
            };
          }
          booking = {
            id_purchase_order_booking: existing.id_purchase_order_booking,
            id_purchase_order_booking_item:
              existing.id_purchase_order_booking_item,
            qty_booking: existing.qty_booking,
          };
        } else {
          booking = await reserveBookingQty(item, t);
        }

        const itemJoPayload = { ...buildItemJoPayload(item), ...booking };

        if (item.id) {
          // update item lama
          await PurchaseOrderItemJo.update(itemJoPayload, {
            where: { id: item.id, id_purchase_order: id },
            transaction: t,
          });
          itemJoIdsToKeep.push(item.id); // fix: push ke array yang benar
        } else {
          // item baru
          const newItem = await PurchaseOrderItemJo.create(itemJoPayload, {
            transaction: t,
          });
          itemJoIdsToKeep.push(newItem.id); // fix: push ke array yang benar
        }
      }

      // nonaktifkan item lama yang sudah tidak ada di payload
      await PurchaseOrderItem.update(
        { is_active: false },
        {
          where: {
            id_purchase_order: id,
            id: { [Op.notIn]: itemIdsToKeep.length ? itemIdsToKeep : [0] },
          },
          transaction: t,
        },
      );

      // nonaktifkan item jo lama yang sudah tidak ada di payload
      await PurchaseOrderItemJo.update(
        { is_active: false },
        {
          where: {
            id_purchase_order: id,
            id: { [Op.notIn]: itemJoIdsToKeep.length ? itemJoIdsToKeep : [0] },
          },
          transaction: t,
        },
      );

      const total = sub_total + total_ppn - (discount ?? dataPo.discount ?? 0);

      await PurchaseOrder.update(
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
  requestPurchaseOrderService: async ({
    id,
    id_request,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const dataPo = await PurchaseOrder.findByPk(id);
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Tidak Ditemukan",
        };
      }

      await PurchaseOrder.update(
        {
          id_request,
          status: "request kabag",
          status_tiket: "request kabag",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "request success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // kabag approve -> status & status_tiket jadi "request finance"
  approveKabagPurchaseOrderService: async ({
    id,
    id_approve_kabag,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const dataPo = await PurchaseOrder.findByPk(id);
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Tidak Ditemukan",
        };
      }

      await PurchaseOrder.update(
        {
          id_approve_kabag,
          status: "request finance",
          status_tiket: "request finance",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "approve kabag success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // finance approve -> status & status_tiket jadi "proses"
  approveFinancePurchaseOrderService: async ({
    id,
    id_approve_finance,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const dataPo = await PurchaseOrder.findByPk(id);
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Tidak Ditemukan",
        };
      }

      await PurchaseOrder.update(
        {
          id_approve_finance,
          status: "approve finance",
          status_tiket: "history",
        },
        { where: { id }, transaction: t },
      );

      // qty yang diambil dari PO booking: pindah dari gudang stock ke gudang booking jo
      const itemJoBooking = await PurchaseOrderItemJo.findAll({
        where: {
          id_purchase_order: id,
          is_active: true,
          is_booking_moved: { [Op.not]: true },
          qty_booking: { [Op.gt]: 0 },
        },
        transaction: t,
      });

      for (const itemJo of itemJoBooking) {
        const createGudangBooking =
          await GudangRawMaterialBookingService.createGudangRawMaterialBookingService(
            {
              id_jo: itemJo.id_jo,
              id_item: itemJo.id_item,
              qty: itemJo.qty_booking,
              rencana_cetak: itemJo.rencana_cetak,
              tipe_barang: itemJo.tipe_barang,
              satuan: itemJo.satuan,
              transaction: t,
            },
          );
        if (createGudangBooking.success === false) {
          throw { message: createGudangBooking.message };
        }

        const useGudangStock =
          await GudangRawMaterialStockService.useGudangRawMaterialStockService({
            id_item: itemJo.id_item,
            qty: itemJo.qty_booking,
            sumber_mutasi: "booking jo",
            id_user: id_approve_finance,
            id_jo_booking: itemJo.id_jo,
            no_jo_booking: itemJo.no_jo,
            transaction: t,
          });
        if (useGudangStock.success === false) {
          throw { message: useGudangStock.message };
        }

        await PurchaseOrderItemJo.update(
          { is_booking_moved: true },
          { where: { id: itemJo.id }, transaction: t },
        );
      }

      // item jo dengan qty_po 0 tidak ada yang dipesan ke vendor (tidak akan ada incoming),
      // jadi langsung done
      await PurchaseOrderItemJo.update(
        { status_po: "done" },
        {
          where: {
            id_purchase_order: id,
            is_active: true,
            [Op.or]: [{ qty_po: { [Op.lte]: 0 } }, { qty_po: null }],
          },
          transaction: t,
        },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "approve finance success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // kabag reject -> status "reject kabag", status_tiket "draft"
  rejectKabagPurchaseOrderService: async ({
    id,
    id_reject_kabag,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const dataPo = await PurchaseOrder.findByPk(id);
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Tidak Ditemukan",
        };
      }

      await PurchaseOrder.update(
        {
          id_reject_kabag,
          status: "reject kabag",
          status_tiket: "draft",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject kabag success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // finance reject -> status "reject finance", status_tiket "draft"
  rejectFinancePurchaseOrderService: async ({
    id,
    id_reject_finance,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const dataPo = await PurchaseOrder.findByPk(id);
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Tidak Ditemukan",
        };
      }

      await PurchaseOrder.update(
        {
          id_reject_finance,
          status: "reject finance",
          status_tiket: "draft",
        },
        { where: { id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject finance success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  closePurchaseOrderService: async ({
    id,
    id_close_po,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const dataPo = await PurchaseOrder.findByPk(id);
      if (!dataPo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Tidak Ditemukan",
        };
      }

      await PurchaseOrder.update(
        {
          id_close_po,
          status_po: "done",
        },
        { where: { id }, transaction: t },
      );

      await PurchaseOrderItemJo.update(
        { status_po: "done" },
        { where: { id_purchase_order: id }, transaction: t },
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

  sendBackToRequestService: async ({
    id_item_jo,
    id_item,
    id_brand,
    nama_item,
    nama_brand,
    qty_sendback,
    id_user_sendback,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const dataPoItemJo = await PurchaseOrderItemJo.findByPk(id_item_jo, {
        include: [
          {
            model: JobOrder,
            as: "job_order",
            include: [
              {
                model: BomPpicModel,
                as: "bom_ppic",
              },
            ],
          },
        ],
      });
      if (!dataPoItemJo) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Item JO Tidak Ditemukan",
        };
      }

      await RequestPurchase.create(
        {
          id_jo: dataPoItemJo.id_jo,
          id_io: dataPoItemJo.job_order.id_io,
          id_so: dataPoItemJo.job_order.id_so,
          id_bom_ppic: dataPoItemJo.job_order.bom_ppic.id,
          id_item: id_item,
          id_brand: id_brand,
          id_request: id_user_sendback,
          no_bom_ppic: dataPoItemJo.job_order.bom_ppic.no_bom_ppic,
          no_jo: dataPoItemJo.no_jo,
          no_so: dataPoItemJo.job_order.no_so,
          no_io: dataPoItemJo.job_order.no_io,
          customer: dataPoItemJo.job_order.customer,
          produk: dataPoItemJo.job_order.produk,
          nama_item: nama_item,
          nama_brand: nama_brand,
          qty: qty_sendback,
          tipe_barang: dataPoItemJo.tipe_barang,
          satuan: dataPoItemJo.satuan,
          tgl_kirim: dataPoItemJo.job_order.tgl_kirim,
          rencana_cetak: dataPoItemJo.rencana_cetak,
          tgl_request: new Date(),
        },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "send back to request success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  // hapus 1 item jo dari PO:
  // item jo nonaktif -> qty booking dilepas -> item PO dikurangi -> total PO dihitung ulang
  // -> kebutuhan dikembalikan ke request purchase
  deleteItemJoPurchaseOrderService: async ({
    id_item_jo,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const itemJo = await PurchaseOrderItemJo.findOne({
        where: { id: id_item_jo, is_active: true },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!itemJo) {
        throw {
          status_code: 404,
          message: "Data Purchase Order Item JO Tidak Ditemukan",
        };
      }

      const dataPo = await getDeletablePo(itemJo.id_purchase_order, t);

      const requestResult = await removeItemJo(itemJo, id_user, t);
      await reducePoItemByItemJo(itemJo, t);
      await ensurePoNotEmpty(dataPo.id, true, t);
      await recalculatePoTotal(dataPo, t);

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "delete item jo success",
        data: requestResult,
      };
    } catch (error) {
      if (!transaction) {
        await t.rollback();
        if (error.status_code) {
          return {
            status_code: error.status_code,
            success: false,
            message: error.message,
          };
        }
      }
      throw { success: false, message: error.message };
    }
  },

  // hapus 1 item PO beserta semua item jo dengan id_item yang sama di PO tersebut
  deleteItemPurchaseOrderService: async ({
    id_item_po,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());
    try {
      const poItem = await PurchaseOrderItem.findOne({
        where: { id: id_item_po, is_active: true },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!poItem) {
        throw {
          status_code: 404,
          message: "Data Purchase Order Item Tidak Ditemukan",
        };
      }

      const dataPo = await getDeletablePo(poItem.id_purchase_order, t);

      const hadItemJo =
        (await PurchaseOrderItemJo.count({
          where: { id_purchase_order: dataPo.id, is_active: true },
          transaction: t,
        })) > 0;

      const itemsJo = await PurchaseOrderItemJo.findAll({
        where: {
          id_purchase_order: dataPo.id,
          id_item: poItem.id_item,
          is_active: true,
        },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      // nonaktifkan semua item jo dulu, baru kembalikan request purchase
      // 1x per kombinasi jo + item (supaya request tidak dobel)
      const groups = new Map();
      for (const itemJo of itemsJo) {
        await removeItemJo(itemJo, id_user, t, { skipRestore: true });
        const key = `${itemJo.id_jo}-${itemJo.id_item}`;
        if (!groups.has(key)) groups.set(key, itemJo);
      }

      const requestResult = { restored_request: 0, created_request: 0 };
      for (const itemJo of groups.values()) {
        const result = await restoreRequestPurchase(itemJo, id_user, t);
        requestResult.restored_request += result.restored_request;
        requestResult.created_request += result.created_request;
      }

      await PurchaseOrderItem.update(
        { is_active: false },
        { where: { id: poItem.id }, transaction: t },
      );

      await ensurePoNotEmpty(dataPo.id, hadItemJo, t);
      await recalculatePoTotal(dataPo, t);

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "delete item success",
        data: { deleted_item_jo: itemsJo.length, ...requestResult },
      };
    } catch (error) {
      if (!transaction) {
        await t.rollback();
        if (error.status_code) {
          return {
            status_code: error.status_code,
            success: false,
            message: error.message,
          };
        }
      }
      throw { success: false, message: error.message };
    }
  },
};

// status PO yang item-nya masih boleh dihapus
const DELETABLE_ITEM_PO_STATUS = ["draft", "reject kabag", "reject finance"];

// ambil PO (di-lock) dan pastikan statusnya masih boleh hapus item
const getDeletablePo = async (id_purchase_order, t) => {
  const dataPo = await PurchaseOrder.findOne({
    where: { id: id_purchase_order, is_active: true },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!dataPo) {
    throw { status_code: 404, message: "Data Purchase Order Tidak Ditemukan" };
  }
  if (!DELETABLE_ITEM_PO_STATUS.includes(dataPo.status)) {
    throw {
      status_code: 400,
      message: `item PO hanya bisa dihapus saat status draft / reject kabag / reject finance (status sekarang: ${dataPo.status})`,
    };
  }
  return dataPo;
};

// nonaktifkan item jo, lepas qty booking, dan kembalikan kebutuhannya ke request purchase
const removeItemJo = async (
  itemJo,
  id_user,
  t,
  { skipRestore = false } = {},
) => {
  if (itemJo.is_booking_moved) {
    throw {
      status_code: 400,
      message: `item jo ${itemJo.no_jo} - ${itemJo.nama_item} sudah ambil qty dari PO booking dan sudah masuk gudang, tidak bisa dihapus`,
    };
  }

  await releaseBookingQty(itemJo, t);
  await PurchaseOrderItemJo.update(
    { is_active: false },
    { where: { id: itemJo.id }, transaction: t },
  );

  if (skipRestore) return null;
  return restoreRequestPurchase(itemJo, id_user, t);
};

// request purchase asal (status "history" di PO ini) dikembalikan ke "incoming".
// kalau tidak ada request asal, atau masih ada item jo lain dengan jo + item yang sama di PO ini
// (request asal masih dipakai item jo tsb), buat request purchase baru.
const restoreRequestPurchase = async (itemJo, id_user, t) => {
  const sameItemJoRemaining = await PurchaseOrderItemJo.count({
    where: {
      id_purchase_order: itemJo.id_purchase_order,
      id_jo: itemJo.id_jo,
      id_item: itemJo.id_item,
      is_active: true,
    },
    transaction: t,
  });

  if (sameItemJoRemaining === 0) {
    const [restored] = await RequestPurchase.update(
      { status: "incoming", id_purchase_order: null },
      {
        where: {
          id_purchase_order: itemJo.id_purchase_order,
          id_jo: itemJo.id_jo,
          id_item: itemJo.id_item,
          is_active: true,
        },
        transaction: t,
      },
    );
    if (restored > 0) return { restored_request: restored, created_request: 0 };
  }

  const jo = itemJo.id_jo
    ? await JobOrder.findByPk(itemJo.id_jo, {
        include: [{ model: BomPpicModel, as: "bom_ppic" }],
        transaction: t,
      })
    : null;

  const qtyBom = Number(itemJo.qty_bom) || 0;
  const qtyRequest =
    qtyBom > 0
      ? qtyBom
      : (Number(itemJo.qty_po) || 0) + (Number(itemJo.qty_booking) || 0);

  await RequestPurchase.create(
    {
      id_jo: itemJo.id_jo,
      id_io: jo?.id_io || null,
      id_so: jo?.id_so || null,
      id_bom_ppic: jo?.bom_ppic?.id || null,
      id_item: itemJo.id_item,
      id_brand: itemJo.id_brand,
      id_request: id_user,
      no_bom_ppic: jo?.bom_ppic?.no_bom_ppic || null,
      no_jo: itemJo.no_jo,
      no_so: jo?.no_so || null,
      no_io: jo?.no_io || null,
      customer: jo?.customer || null,
      produk: jo?.produk || null,
      nama_item: itemJo.nama_item,
      nama_brand: itemJo.nama_brand,
      qty: qtyRequest,
      tipe_barang: itemJo.tipe_barang,
      satuan: itemJo.satuan,
      tgl_kirim: jo?.tgl_kirim || itemJo.tgl_kirim || null,
      rencana_cetak: itemJo.rencana_cetak,
      tgl_request: new Date(),
    },
    { transaction: t },
  );

  return { restored_request: 0, created_request: 1 };
};

// kurangi qty & qty_beli item PO (id_item sama) sebesar qty_po item jo yang dihapus.
// qty_booking tidak ikut dikurangi karena bukan qty yang dipesan ke vendor.
// item PO yang qty-nya jadi 0 ikut dinonaktifkan.
const reducePoItemByItemJo = async (itemJo, t) => {
  const qtyPo = Number(itemJo.qty_po) || 0;
  if (qtyPo <= 0) return;

  const poItem = await PurchaseOrderItem.findOne({
    where: {
      id_purchase_order: itemJo.id_purchase_order,
      id_item: itemJo.id_item,
      is_active: true,
    },
    order: [["id", "ASC"]],
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!poItem) return;

  const qty = Math.max((Number(poItem.qty) || 0) - qtyPo, 0);
  const qty_beli = Math.max((Number(poItem.qty_beli) || 0) - qtyPo, 0);
  const total = qty_beli * (Number(poItem.harga) || 0);
  const ppn = poItem.is_ppn ? total * 0.11 : 0;

  await PurchaseOrderItem.update(
    { qty, qty_beli, total, ppn, is_active: qty > 0 },
    { where: { id: poItem.id }, transaction: t },
  );
};

// PO tidak boleh kosong: minimal 1 item PO aktif,
// dan kalau sebelumnya punya item jo, minimal 1 item jo aktif
const ensurePoNotEmpty = async (id_purchase_order, hadItemJo, t) => {
  const activeItem = await PurchaseOrderItem.count({
    where: { id_purchase_order, is_active: true },
    transaction: t,
  });
  const activeItemJo = await PurchaseOrderItemJo.count({
    where: { id_purchase_order, is_active: true },
    transaction: t,
  });
  if (activeItem === 0 || (hadItemJo && activeItemJo === 0)) {
    throw {
      status_code: 400,
      message: "item terakhir tidak bisa dihapus, Purchase Order tidak boleh kosong",
    };
  }
};

// hitung ulang sub_total, ppn, total PO dari item PO yang masih aktif
const recalculatePoTotal = async (dataPo, t) => {
  const activeItems = await PurchaseOrderItem.findAll({
    where: { id_purchase_order: dataPo.id, is_active: true },
    transaction: t,
  });

  let sub_total = 0;
  let total_ppn = 0;
  for (const item of activeItems) {
    sub_total += Number(item.total) || 0;
    total_ppn += Number(item.ppn) || 0;
  }

  await PurchaseOrder.update(
    {
      sub_total,
      ppn: total_ppn,
      total: sub_total + total_ppn - (Number(dataPo.discount) || 0),
    },
    { where: { id: dataPo.id }, transaction: t },
  );
};

// payload item jo, qty_lebih dihitung dari total qty_po + qty_booking dibanding qty_bom
const buildItemJoPayload = (item) => {
  const qtyPo = Number(item.qty_po) || 0;
  const qtyBom = Number(item.qty_bom) || 0;
  const qtyBooking = Number(item.qty_booking) || 0;
  const qtyLebih = Math.max(qtyPo + qtyBooking - qtyBom, 0);

  return {
    id_jo: item.id_jo || null,
    id_item: item.id_item || null,
    id_brand: item.id_brand || null,
    no_jo: item.no_jo || null,
    nama_item: item.nama_item || null,
    nama_brand: item.nama_brand || null,
    qty_bom: qtyBom,
    qty_po: item.qty_po,
    qty_lebih: qtyLebih,
    qty_sisa: item.qty_po,
    tipe_barang: item.tipe_barang || null,
    satuan: item.satuan || null,
    tgl_kirim: item.tgl_kirim || null,
    rencana_cetak: item.rencana_cetak || null,
  };
};

// pakai qty dari PO booking item (qty_pakai += qty_booking)
// syarat: PO booking sudah approve finance & qty_terkirim - qty_pakai masih cukup
const reserveBookingQty = async (item, t) => {
  const qtyBooking = Number(item.qty_booking) || 0;
  if (!item.id_purchase_order_booking_item || qtyBooking <= 0) {
    return {
      id_purchase_order_booking: null,
      id_purchase_order_booking_item: null,
      qty_booking: 0,
    };
  }

  const bookingItem = await PurchaseOrderBookingItem.findOne({
    where: { id: item.id_purchase_order_booking_item, is_active: true },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (!bookingItem) {
    throw { message: "Data Purchase Order Booking Item Tidak Ditemukan" };
  }

  const bookingPo = await PurchaseOrderBooking.findOne({
    where: { id: bookingItem.id_purchase_order_booking, is_active: true },
    transaction: t,
  });
  if (!bookingPo || bookingPo.status !== "approve finance") {
    throw { message: "PO booking belum approve finance" };
  }

  if (item.id_item && String(item.id_item) !== String(bookingItem.id_item)) {
    throw {
      message: `item PO booking (${bookingItem.nama_item}) tidak sama dengan item jo (${item.nama_item})`,
    };
  }

  const qtyTersedia =
    (bookingItem.qty_terkirim || 0) - (bookingItem.qty_pakai || 0);
  if (qtyBooking > qtyTersedia) {
    throw {
      message: `qty booking ${bookingItem.nama_item} dari PO ${bookingPo.no_purchase_order} melebihi qty tersedia (${qtyTersedia})`,
    };
  }

  await PurchaseOrderBookingItem.update(
    { qty_pakai: (bookingItem.qty_pakai || 0) + qtyBooking },
    { where: { id: bookingItem.id }, transaction: t },
  );

  return {
    id_purchase_order_booking: bookingItem.id_purchase_order_booking,
    id_purchase_order_booking_item: bookingItem.id,
    qty_booking: qtyBooking,
  };
};

// kembalikan qty_pakai PO booking item dari item jo (dipakai saat update PO)
const releaseBookingQty = async (itemJo, t) => {
  const qtyBooking = Number(itemJo.qty_booking) || 0;
  if (!itemJo.id_purchase_order_booking_item || qtyBooking <= 0) return;

  const bookingItem = await PurchaseOrderBookingItem.findByPk(
    itemJo.id_purchase_order_booking_item,
    { transaction: t, lock: t.LOCK.UPDATE },
  );
  if (!bookingItem) return;

  await PurchaseOrderBookingItem.update(
    { qty_pakai: Math.max((bookingItem.qty_pakai || 0) - qtyBooking, 0) },
    { where: { id: bookingItem.id }, transaction: t },
  );
};

/**
 * Aturan rekap Purchase Order:
 * 1. Hanya PurchaseOrderItemJo berstatus "progress" dan "done" yang dihitung.
 * 2. Status "progress": total qty menggunakan qty_po.
 * 3. Status "done": total qty menggunakan qty_terkirim dan OTS menjadi 0.
 * 4. Terkirim qty selalu menggunakan qty_terkirim.
 * 5. OTS qty = total qty - terkirim qty.
 * 6. Harga diambil dari PurchaseOrderItem pada PO yang sama dan dicocokkan
 *    berdasarkan id_item.
 * 7. Total rupiah = total qty * harga.
 * 8. OTS rupiah = OTS qty * harga.
 * 9. Terkirim rupiah = terkirim qty * harga.
 *
 * Dengan aturan tersebut:
 * total qty = OTS qty + terkirim qty
 * total rupiah = OTS rupiah + terkirim rupiah
 */
const calculatePurchaseOrderRecap = (purchaseOrders) => {
  const rekap = {
    total_qty: 0,
    total_rupiah: 0,
    ots_qty: 0,
    ots_rupiah: 0,
    terkirim_qty: 0,
    terkirim_rupiah: 0,
  };

  purchaseOrders.forEach((purchaseOrder) => {
    const hargaByItem = new Map();

    (purchaseOrder.items || []).forEach((item) => {
      if (item.id_item != null) {
        hargaByItem.set(String(item.id_item), Number(item.harga) || 0);
      }
    });

    (purchaseOrder.items_jo || []).forEach((itemJo) => {
      const qtyPo = Number(itemJo.qty_po) || 0;
      const qtyTerkirim = Number(itemJo.qty_terkirim) || 0;
      const statusPo = String(itemJo.status_po).toLowerCase();

      if (statusPo !== "progress" && statusPo !== "done") return;

      // Saat done, qty_po tidak lagi menjadi acuan karena total akhirnya
      // mengikuti jumlah yang benar-benar terkirim.
      const isDone = statusPo === "done";
      const totalQty = isDone ? qtyTerkirim : qtyPo;
      const otsQty = totalQty - qtyTerkirim;

      // Pencocokan harga dibatasi pada item yang berada di PO yang sedang
      // diproses, sehingga id_item yang sama dari PO lain tidak tercampur.
      const harga =
        itemJo.id_item == null
          ? 0
          : hargaByItem.get(String(itemJo.id_item)) || 0;

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

module.exports = PurchaseOrderService;
