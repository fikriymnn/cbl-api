const db = require("../../../../config/database");
const { Op, Sequelize, literal } = require("sequelize");
const PurchaseOrder = require("../../../../model/purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItem = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemModel");
const PurchaseOrderItemJo = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemJoModel");
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
  generateNoPurchaseOrder: async (transaction = null) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

    const lastData = await PurchaseOrder.findOne({
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

    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

    let nextNumber = 1;
    if (lastData) {
      const lastNo = lastData.no_purchase_order; // contoh: "0713/CBL/072026"
      const lastSeq = parseInt(lastNo.substring(0, lastNo.indexOf("/")), 10);
      nextNumber = lastSeq + 1;
    }

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
        const qty_beli = item.qty_beli || item.qty || 0;
        const harga = item.harga || 0;
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

      const itemsJoPayload = items_jo.map((item) => {
        let qtyLebih = 0;

        if (item.qty_po > item.qty_bom) {
          qtyLebih = item.qty_po - item.qty_bom;
        }
        return {
          id_jo: item.id_jo || null,
          id_item: item.id_item || null,
          id_brand: item.id_brand || null,
          no_jo: item.no_jo || null,
          nama_item: item.nama_item || null,
          nama_brand: item.nama_brand || null,
          qty_bom: item.qty_bom || 0,
          qty_po: item.qty_po,
          qty_lebih: qtyLebih,
          qty_sisa: item.qty_po,
          tipe_barang: item.tipe_barang || null,
          satuan: item.satuan || null,
          tgl_kirim: item.tgl_kirim || null,
          rencana_cetak: item.rencana_cetak || null,
        };
      });

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
        const qty_beli = item.qty_beli || item.qty || 0;
        const harga = item.harga || 0;
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
      for (const item of items_jo) {
        let qtyLebih = 0;

        if (item.qty_po > item.qty_bom) {
          qtyLebih = item.qty_po - item.qty_bom; // fix: "tem" -> "item"
        }
        const itemJoPayload = {
          id_jo: item.id_jo || null,
          id_item: item.id_item || null,
          id_brand: item.id_brand || null,
          no_jo: item.no_jo || null,
          nama_item: item.nama_item || null,
          nama_brand: item.nama_brand || null,
          qty_bom: item.qty_bom || 0,
          qty_po: item.qty_po,
          qty_lebih: qtyLebih,
          qty_sisa: item.qty_po,
          tipe_barang: item.tipe_barang || null,
          satuan: item.satuan || null,
          tgl_kirim: item.tgl_kirim || null,
          rencana_cetak: item.rencana_cetak || null,
        };

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
          product: dataPoItemJo.job_order.product,
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
