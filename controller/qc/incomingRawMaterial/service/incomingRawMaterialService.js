const db = require("../../../../config/database");
const { Op, fn, col, literal } = require("sequelize");
const IncomingRawMaterial = require("../../../../model/qc/incomingRawMaterial/incomingRawMaterialModel");
const PurchaseOrder = require("../../../../model/purchasing/purchaseOrder/purchaseOrderModel");
const PurchaseOrderItemJo = require("../../../../model/purchasing/purchaseOrder/purchaseOrderItemJoModel");
const PurchaseOrderBooking = require("../../../../model/purchasing/purchaseOrderBooking/purchaseOrderBookingModel");
const PurchaseOrderBookingItem = require("../../../../model/purchasing/purchaseOrderBooking/purchaseOrderBookingItemModel");
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
    id_purchase_order_booking,
    id_purchase_order_booking_item,
    is_booking,
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
    if (id_purchase_order_booking)
      obj.id_purchase_order_booking = id_purchase_order_booking;
    if (id_purchase_order_booking_item)
      obj.id_purchase_order_booking_item = id_purchase_order_booking_item;
    // is_booking=true -> hanya incoming PO booking, is_booking=false -> hanya incoming PO biasa
    if (is_booking === "true" || is_booking === true) {
      obj.id_purchase_order_booking_item = { [Op.ne]: null };
    } else if (is_booking === "false" || is_booking === false) {
      obj.id_purchase_order_booking_item = null;
    }
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
            {
              model: PurchaseOrderBooking,
              as: "purchase_order_booking",
            },
            {
              model: PurchaseOrderBookingItem,
              as: "purchase_order_booking_item",
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
              model: PurchaseOrderBooking,
              as: "purchase_order_booking",
            },
            {
              model: PurchaseOrderBookingItem,
              as: "purchase_order_booking_item",
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

  getNoGoodReceiptService: async () => {
    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      const lastGoodReceipt = await IncomingRawMaterial.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          // extract nomor urut pada format SI00001/CBL/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_good_receipt, 5), '/', 1) AS UNSIGNED)`,
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

      if (lastGoodReceipt) {
        const lastNo = lastGoodReceipt.no_good_receipt; // contoh: SJB00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(4, lastNo.indexOf("/")), 10);

        nextNumber = lastSeq + 1;
      }

      // 3. Buat nomor urut padded 5 digit
      const paddedNumber = String(nextNumber).padStart(5, "0");

      // 4. Susun format akhir
      const newInvoiceNumber = `GRM-${paddedNumber}/CBL/${currentMonth}/${shortYear}`;
      return {
        status: 200,
        success: true,
        no_good_receipt: lastGoodReceipt?.no_good_receipt,
        new_no_good_receipt: newInvoiceNumber,
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
  // tiap item diisi salah satu:
  // - id_purchase_order_item_jo      -> PO biasa, status_qc item jo jadi "request qc"
  // - id_purchase_order_booking_item -> PO booking, tidak ada qty_idle (semua qty_incoming masuk gudang stock),
  //                                     status_qc item booking jadi "request qc"
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

      if (
        items.some(
          (item) =>
            !item.id_purchase_order_item_jo &&
            !item.id_purchase_order_booking_item,
        )
      ) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message:
            "id_purchase_order_item_jo atau id_purchase_order_booking_item tidak boleh kosong",
        };
      }

      if (
        items.some(
          (item) =>
            item.id_purchase_order_item_jo &&
            item.id_purchase_order_booking_item,
        )
      ) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message:
            "id_purchase_order_item_jo dan id_purchase_order_booking_item tidak boleh diisi bersamaan",
        };
      }

      const itemJoIds = items
        .filter((item) => item.id_purchase_order_item_jo)
        .map((item) => item.id_purchase_order_item_jo);
      const itemBookingIds = items
        .filter((item) => item.id_purchase_order_booking_item)
        .map((item) => item.id_purchase_order_booking_item);

      if (itemJoIds.length > 0) {
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
      }

      // id_purchase_order_booking diambil dari item booking-nya
      const bookingIdByItem = new Map();
      if (itemBookingIds.length > 0) {
        const foundItemBooking = await PurchaseOrderBookingItem.findAll({
          where: { id: { [Op.in]: itemBookingIds }, is_active: true },
          transaction: t,
        });
        if (foundItemBooking.length !== new Set(itemBookingIds).size) {
          if (!transaction) await t.rollback();
          return {
            status_code: 404,
            success: false,
            message: "Data Purchase Order Booking Item Tidak Ditemukan",
          };
        }
        foundItemBooking.forEach((item) =>
          bookingIdByItem.set(
            String(item.id),
            item.id_purchase_order_booking,
          ),
        );
      }

      const payload = items.map((item) => {
        const isBooking = Boolean(item.id_purchase_order_booking_item);
        return {
          id_purchase_order: isBooking ? null : item.id_purchase_order || null,
          id_purchase_order_item_jo: isBooking
            ? null
            : item.id_purchase_order_item_jo,
          id_purchase_order_booking: isBooking
            ? bookingIdByItem.get(String(item.id_purchase_order_booking_item))
            : null,
          id_purchase_order_booking_item: isBooking
            ? item.id_purchase_order_booking_item
            : null,
          id_request,
          no_surat_jalan: item.no_surat_jalan || null,
          no_good_receipt: item.no_good_receipt || null,
          qty_incoming: item.qty_incoming || 0,
          // PO booking tidak ada qty idle
          qty_idle: isBooking ? 0 : item.qty_idle || 0,
          qty_pallet: item.qty_pallet || 0,
          tgl_request: new Date(),
          status: "incoming",
          status_ticket: "incoming",
          is_active: true,
        };
      });

      const newData = await IncomingRawMaterial.bulkCreate(payload, {
        transaction: t,
      });

      if (itemJoIds.length > 0) {
        await PurchaseOrderItemJo.update(
          { status_qc: "request qc" },
          { where: { id: { [Op.in]: itemJoIds } }, transaction: t },
        );
      }

      if (itemBookingIds.length > 0) {
        await PurchaseOrderBookingItem.update(
          { status_qc: "request qc" },
          { where: { id: { [Op.in]: itemBookingIds } }, transaction: t },
        );
      }

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
  // PO biasa: update PurchaseOrderItemJo: status_qc "approve qc", qty_terkirim += qty_incoming,
  // qty_sisa -= qty_incoming, dan jika qty_terkirim sudah >= qty_po maka status_po "done"
  // PO booking: lihat approveIncomingBooking
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
          {
            model: PurchaseOrderBookingItem,
            as: "purchase_order_booking_item",
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

      if (dataIrm.id_purchase_order_booking_item) {
        await approveIncomingBooking({ dataIrm, id_approve, note, t });

        if (!transaction) await t.commit();
        return {
          status_code: 200,
          success: true,
          message: "approve success",
        };
      }

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
              no_good_receipt: dataIrm.no_good_receipt || null,
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
              no_good_receipt: dataIrm.no_good_receipt || null,
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
              no_good_receipt: dataIrm.no_good_receipt || null,
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
  // lalu update status_qc item jo / item booking jadi "reject qc"
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

      if (dataIrm.id_purchase_order_booking_item) {
        await PurchaseOrderBookingItem.update(
          { status_qc: "reject qc" },
          {
            where: { id: dataIrm.id_purchase_order_booking_item },
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

// approve incoming dari PO booking:
// - update PurchaseOrderBookingItem: status_qc "approve qc", qty_terkirim += qty_incoming,
//   qty_sisa -= qty_incoming, jika qty_terkirim >= qty_beli maka status_po "done"
// - semua qty_incoming masuk gudang stock (tanpa jo) + mutasi barang raw material
const approveIncomingBooking = async ({ dataIrm, id_approve, note, t }) => {
  const itemBooking = dataIrm.purchase_order_booking_item;
  if (!itemBooking) {
    throw {
      success: false,
      status_code: 404,
      message: "Data Purchase Order Booking Item Tidak Ditemukan",
    };
  }

  const qtyIncoming = dataIrm.qty_incoming || 0;
  const qty_terkirim = (itemBooking.qty_terkirim || 0) + qtyIncoming;
  const qty_sisa = (itemBooking.qty_sisa || 0) - qtyIncoming;

  const itemBookingPayload = {
    status_qc: "approve qc",
    qty_terkirim,
    qty_sisa,
  };

  if (qty_terkirim >= (itemBooking.qty_beli || 0)) {
    itemBookingPayload.status_po = "done";
  }

  await PurchaseOrderBookingItem.update(itemBookingPayload, {
    where: { id: itemBooking.id },
    transaction: t,
  });

  if (qtyIncoming <= 0) return;

  //masuk gudang Stock
  const createGudangStock =
    await GudangRawMaterialStockService.createGudangRawMaterialStockService({
      id_item: itemBooking.id_item,
      qty: qtyIncoming,
      tipe_barang: itemBooking.tipe_barang,
      satuan: itemBooking.satuan,
      id_user: id_approve,
      sumber_mutasi: "po booking",
      no_surat_jalan: dataIrm.no_surat_jalan || null,
      no_good_receipt: dataIrm.no_good_receipt || null,
      transaction: t,
    });

  if (createGudangStock.success === false) {
    throw {
      success: false,
      status_code: 400,
      message: createGudangStock.message,
    };
  }

  //masuk mutasi
  const createMutasiBarang =
    await MutasiBarangRawMaterialService.creteMutasiBarangRawMaterialService({
      id_item: itemBooking.id_item,
      id_user: id_approve,
      id_jo_booking: null,
      jumlah_qty: qtyIncoming,
      type_mutasi: "masuk",
      sumber_mutasi: "po booking",
      note: note || null,
      tgl_mutasi: new Date(),
      no_surat_jalan: dataIrm.no_surat_jalan || null,
      no_good_receipt: dataIrm.no_good_receipt || null,
      transaction: t,
    });

  if (createMutasiBarang.success === false) {
    throw {
      success: false,
      status_code: 400,
      message: createMutasiBarang.message,
    };
  }
};

module.exports = IncomingRawMaterialService;
