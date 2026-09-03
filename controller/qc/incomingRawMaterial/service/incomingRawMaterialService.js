const db = require("../../../../config/database");
const { Op, fn, col, literal } = require("sequelize");
const IncomingRawMaterial = require("../../../../model/qc/incomingRawMaterial/incomingRawMaterialModel");
const PurchaseOrder = require("../../../../model/purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItemJo = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemJoModel");
const Users = require("../../../../model/userModel");
const MutasiBarangRawMaterialService = require("../../../gudangRM/mutasiBarangRawMaterial/service/mutasiBarangRawMaterialService");
const GudangRawMaterialBookingService = require("../../../gudangRM/gudangRawMaterialBooking/service/gudangRawMaterialBookingService");
const GudangRawMaterialStockService = require("../../../gudangRM/gudangRawMaterialStock/service/gudangRawMaterialStockService");
// NOTE: sesuaikan path require di atas dengan lokasi file model/service kamu yang sebenarnya.

const IncomingRawMaterialService = {
  getIncomingRawMaterialService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_purchase_order,
    id_purchase_order_item_jo,
    status,
    status_ticket,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (search) {
      obj = {
        [Op.or]: [{ no_surat_jalan: { [Op.like]: `%${search}%` } }],
      };
    }

    if (id_purchase_order) obj.id_purchase_order = id_purchase_order;
    if (id_purchase_order_item_jo)
      obj.id_purchase_order_item_jo = id_purchase_order_item_jo;
    if (status) obj.status = status;
    if (status_ticket) obj.status_ticket = status_ticket;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (page && limit) {
        const length = await IncomingRawMaterial.count({ where: obj });
        const data = await IncomingRawMaterial.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: PurchaseOrder,
              as: "purchase_order",
            },
            {
              model: PurchaseOrderItemJo,
              as: "purchase_order_item_jo",
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
        const data = await IncomingRawMaterial.findByPk(id, {
          include: [
            {
              model: PurchaseOrder,
              as: "purchase_order",
            },
            {
              model: PurchaseOrderItemJo,
              as: "purchase_order_item_jo",
            },
            {
              model: Users,
              as: "user_request",
            },
            {
              model: Users,
              as: "user_approve",
            },
            {
              model: Users,
              as: "user_reject",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await IncomingRawMaterial.findAll({
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

  getNoSuratJalanService: async () => {
    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      const lastSuratJalan = await IncomingRawMaterial.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          // extract nomor urut pada format SI00001/CBL/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_surat_jalan, 5), '/', 1) AS UNSIGNED)`,
            ),
            "DESC",
          ],
          ["createdAt", "DESC"], // jika nomor urut sama, ambil yang terbaru
        ],
      });

      //tentukan no selanjutnya
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      const shortYear = String(currentYear).slice(2); // 2025 => "25"
      // 2. Tentukan nomor urut berikutnya
      let nextNumber = 1;

      if (lastSuratJalan) {
        const lastNo = lastSuratJalan.no_surat_jalan; // contoh: SJB00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(4, lastNo.indexOf("/")), 10);

        nextNumber = lastSeq + 1;
      }

      // 3. Buat nomor urut padded 5 digit
      const paddedNumber = String(nextNumber).padStart(5, "0");

      // 4. Susun format akhir
      const newInvoiceNumber = `SJB-${paddedNumber}/CBL/${currentMonth}/${shortYear}`;
      return {
        status: 200,
        success: true,
        no_surat_jalan: lastSuratJalan?.no_surat_jalan,
        new_no_surat_jalan: newInvoiceNumber,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  // create incoming raw material, bisa beberapa sekaligus (bulk) -> id_request dari user yg action
  // sekaligus update PurchaseOrderItemJo.status_qc jadi "request qc" untuk semua item_jo terkait
  createIncomingRawMaterialService: async ({
    items = [],
    id_request,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!items || items.length === 0) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "items tidak boleh kosong",
        };
      }

      const itemJoIds = items.map((item) => item.id_purchase_order_item_jo);
      if (itemJoIds.some((id) => !id)) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "id_purchase_order_item_jo tidak boleh kosong",
        };
      }

      const foundItemJo = await PurchaseOrderItemJo.findAll({
        where: { id: { [Op.in]: itemJoIds } },
        transaction: t,
      });
      if (foundItemJo.length !== new Set(itemJoIds).size) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Purchase Order Item Jo Tidak Ditemukan",
        };
      }

      const payload = items.map((item) => ({
        id_purchase_order: item.id_purchase_order || null,
        id_purchase_order_item_jo: item.id_purchase_order_item_jo,
        id_request,
        no_surat_jalan: item.no_surat_jalan || null,
        qty_incoming: item.qty_incoming || 0,
        qty_idle: item.qty_idle || 0,
        qty_pallet: item.qty_pallet || 0,
        tgl_request: new Date(),
        status: "incoming",
        status_ticket: "incoming",
        is_active: true,
      }));

      const newData = await IncomingRawMaterial.bulkCreate(payload, {
        transaction: t,
      });

      await PurchaseOrderItemJo.update(
        { status_qc: "request qc" },
        { where: { id: { [Op.in]: itemJoIds } }, transaction: t },
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
  // approve -> status "approve", status_ticket "history", id_approve, tgl_action
  // lalu update PurchaseOrderItemJo: status_qc "approve qc", qty_terkirim += qty_incoming,
  // qty_sisa -= qty_incoming, dan jika qty_terkirim sudah >= qty_po maka status_po "done"
  approveIncomingRawMaterialService: async ({
    id,
    id_approve,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataIrm = await IncomingRawMaterial.findByPk(id, {
        include: [
          {
            model: PurchaseOrderItemJo,
            as: "purchase_order_item_jo",
          },
        ],
        transaction: t,
      });
      if (!dataIrm) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Incoming Raw Material Tidak Ditemukan",
        };
      }

      await IncomingRawMaterial.update(
        {
          note: note,
          id_approve,
          status: "approve",
          status_ticket: "history",
          tgl_action: new Date(),
        },
        { where: { id }, transaction: t },
      );

      const itemJo = await PurchaseOrderItemJo.findByPk(
        dataIrm.id_purchase_order_item_jo,
        { transaction: t },
      );

      if (itemJo) {
        const qtyIncoming = dataIrm.qty_incoming || 0;
        const qtyIdle = dataIrm.qty_idle || 0;
        const qty_terkirim = (itemJo.qty_terkirim || 0) + qtyIncoming;
        const qty_sisa = (itemJo.qty_sisa || 0) - qtyIncoming;
        const qty_idle = (itemJo.qty_idle || 0) + qtyIdle;

        const itemJoPayload = {
          status_qc: "approve qc",
          qty_terkirim,
          qty_sisa,
          qty_idle,
        };

        if (qty_terkirim >= itemJo.qty_po) {
          itemJoPayload.status_po = "done";
        }

        await PurchaseOrderItemJo.update(itemJoPayload, {
          where: { id: itemJo.id },
          transaction: t,
        });
      }

      if (dataIrm.qty_incoming > 0) {
        //masuk gudang booking
        const createGudangBooking =
          await GudangRawMaterialBookingService.createGudangRawMaterialBookingService(
            {
              id_jo: dataIrm.purchase_order_item_jo.id_jo,
              id_item: dataIrm.purchase_order_item_jo.id_item,
              qty: dataIrm.qty_incoming,
              rencana_cetak: dataIrm.purchase_order_item_jo.rencana_cetak,
              tipe_barang: dataIrm.purchase_order_item_jo.tipe_barang,
              satuan: dataIrm.purchase_order_item_jo.satuan,
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

        //masuk mutasi
        const createMutasiBarang =
          await MutasiBarangRawMaterialService.creteMutasiBarangRawMaterialService(
            {
              id_item: dataIrm.purchase_order_item_jo.id_item,
              id_user: id_approve,
              id_jo_booking: dataIrm.purchase_order_item_jo.id_jo,
              jumlah_qty: dataIrm.qty_incoming,
              type_mutasi: "masuk",
              sumber_mutasi: "normal",
              note: note || null,
              tgl_mutasi: new Date(),
              no_surat_jalan: dataIrm.no_surat_jalan || null,
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
      }

      if (dataIrm.qty_idle > 0) {
        //masuk gudang Stock
        const createGudangStock =
          await GudangRawMaterialStockService.createGudangRawMaterialStockService(
            {
              id_item: dataIrm.purchase_order_item_jo.id_item,
              qty: dataIrm.qty_idle,
              tipe_barang: dataIrm.purchase_order_item_jo.tipe_barang,
              satuan: dataIrm.purchase_order_item_jo.satuan,
              id_user: id_approve,
              sumber_mutasi: "idle",
              no_surat_jalan: dataIrm.no_surat_jalan || null,
              transaction: t,
            },
          );

        if (createGudangStock.success === false) {
          throw {
            success: false,
            status_code: 400,
            message: createGudangStock.message,
          };
        }
        const createMutasiBarang =
          await MutasiBarangRawMaterialService.creteMutasiBarangRawMaterialService(
            {
              id_item: dataIrm.purchase_order_item_jo.id_item,
              id_user: id_approve,
              id_jo_booking: null,
              jumlah_qty: dataIrm.qty_idle,
              type_mutasi: "masuk",
              sumber_mutasi: "idle",
              note: note || null,
              tgl_mutasi: new Date(),
              no_surat_jalan: dataIrm.no_surat_jalan || null,
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
      }

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

  // reject -> status "reject qc", status_ticket "history", id_reject, tgl_action
  // lalu update PurchaseOrderItemJo.status_qc jadi "reject qc"
  rejectIncomingRawMaterialService: async ({
    id,
    id_reject,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataIrm = await IncomingRawMaterial.findByPk(id, {
        transaction: t,
      });
      if (!dataIrm) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Incoming Raw Material Tidak Ditemukan",
        };
      }

      await IncomingRawMaterial.update(
        {
          note: note,
          id_reject,
          status: "reject qc",
          status_ticket: "history",
          tgl_action: new Date(),
        },
        { where: { id }, transaction: t },
      );

      if (dataIrm.id_purchase_order_item_jo) {
        await PurchaseOrderItemJo.update(
          { status_qc: "reject qc" },
          {
            where: { id: dataIrm.id_purchase_order_item_jo },
            transaction: t,
          },
        );
      }

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

module.exports = IncomingRawMaterialService;
