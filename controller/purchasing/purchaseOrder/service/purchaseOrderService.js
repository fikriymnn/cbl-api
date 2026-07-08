const db = require("../../../../config/database");
const { Op, Sequelize, literal } = require("sequelize");
const PurchaseOrder = require("../../../../model/purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItem = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const BomPpicModel = require("../../../../model/ppic/bomPpic/bomPpicModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../../model/userModel");

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
    start_date,
    end_date,
    search,
    id_jo,
    id_io,
    id_so,
    id_bom_ppic,
    status,
    status_tiket,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { no_purchase_order: { [Op.like]: `%${search}%` } },
          { nama_vendor: { [Op.like]: `%${search}%` } },
          { note_internal: { [Op.like]: `%${search}%` } },
          { note_supplier: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_bom_ppic) obj.id_bom_ppic = id_bom_ppic;
    if (status) obj.status = status;
    if (status_tiket) obj.status_tiket = status_tiket;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;
    try {
      if (page && limit) {
        const length = await PurchaseOrder.count({ where: obj });
        const data = await PurchaseOrder.findAll({
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

  createPurchaseOrderService: async ({
    id_create,
    id_jo,
    id_io,
    id_so,
    id_bom_ppic,
    nama_vendor,
    tgl_po,
    tgl_kirim,
    discount = 0,
    note_internal,
    note_supplier,
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
          message: "Item Purchase Order tidak boleh kosong",
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
          nama_item: item.nama_item || null,
          qty: item.qty || 0,
          qty_beli,
          tipe_barang: item.tipe_barang || null,
          satuan: item.satuan || null,
          harga,
          total: totalItem,
          ppn: ppnItem,
          is_ppn: item.is_ppn || false,
          is_active: true,
        };
      });

      const total = sub_total + total_ppn - (discount || 0);

      const newPo = await PurchaseOrder.create(
        {
          id_create,
          no_purchase_order,
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
          is_active: true,
        },
        { transaction: t },
      );

      const itemsWithPoId = itemsPayload.map((item) => ({
        ...item,
        id_purchase_order: newPo.id,
      }));

      await PurchaseOrderItem.bulkCreate(itemsWithPoId, { transaction: t });

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
    nama_vendor,
    tgl_po,
    tgl_kirim,
    discount,
    note_internal,
    note_supplier,
    items = [],
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
          nama_item: item.nama_item || null,
          qty: item.qty || 0,
          qty_beli,
          tipe_barang: item.tipe_barang || null,
          satuan: item.satuan || null,
          harga,
          total: totalItem,
          ppn: ppnItem,
          is_ppn: item.is_ppn || false,
          is_active: true,
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

      const total = sub_total + total_ppn - (discount ?? dataPo.discount ?? 0);

      await PurchaseOrder.update(
        {
          nama_vendor: nama_vendor ?? dataPo.nama_vendor,
          tgl_po: tgl_po ?? dataPo.tgl_po,
          tgl_kirim: tgl_kirim ?? dataPo.tgl_kirim,
          sub_total,
          discount: discount ?? dataPo.discount,
          ppn: total_ppn,
          total,
          note_internal: note_internal ?? dataPo.note_internal,
          note_supplier: note_supplier ?? dataPo.note_supplier,
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
          status: "proses",
          status_tiket: "proses",
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
};

module.exports = PurchaseOrderService;
