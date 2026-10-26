const db = require("../../../../config/database");
const { Op, literal } = require("sequelize");
const InvoiceApModel = require("../../../../model/akunting/invoiceAp/invoiceApModel");
const InvoiceApItemModel = require("../../../../model/akunting/invoiceAp/invoiceApItemModel");
const GoodReceipt = require("../../../../model/akunting/goodReceipt/goodReceiptModel");
const Users = require("../../../../model/userModel");
const InvoiceApPayment = require("../../../../model/akunting/invoiceAp/invoiceApPaymentModel");
const InvoiceApPaymentDetail = require("../../../../model/akunting/invoiceAp/invoiceApPaymentDetailModel");
const InvoiceApPaymentAdditionalCost = require("../../../../model/akunting/invoiceAp/invoiceApPaymentAdditionalCostModel");
const {
  toBigInt,
  buildDateRangeFilter,
  getDueTimeDatabaseFilter,
  DUE_TIME_BUCKETS,
  getInvoiceDueTime,
  createInvoiceRecap,
  addInvoiceToRecap,
  serializeInvoiceRecap,
  formatInvoiceRecapDetail,
  parseRecapDateRange,
  fillMissingSettlementDate,
  normalizeIds,
  getInvoicesForBulk,
  validateBulkInvoices,
} = require("../../invoice/service/invoiceHelper");

// riwayat pembayaran invoice ap (bukti bayar + biaya tambahan)
const paymentDetailsInclude = {
  model: InvoiceApPaymentDetail,
  as: "payment_details",
  include: [
    { model: InvoiceApPayment, as: "payment" },
    { model: InvoiceApPaymentAdditionalCost, as: "additional_costs" },
  ],
};

// alur sama dengan invoice ar (draft -> requested -> approved / rejected),
// bedanya sumber item dari list good receipt dan wajib 1 vendor per invoice
const InvoiceApService = {
  // list ap: invoice ap approved yang belum lunas, dikelompokkan per vendor
  getAccountPayableService: async ({
    start_date,
    end_date,
    search,
    id_vendor,
    waktu,
  }) => {
    const where = {
      is_active: true,
      status: "approved",
      status_proses: "done",
      balance_due: { [Op.gt]: 0 },
      [Op.and]: [
        literal("COALESCE(balance_due, 0) > COALESCE(paid_amount, 0)"),
        {
          [Op.or]: [
            { status_payment: { [Op.ne]: "lunas" } },
            { status_payment: null },
          ],
        },
      ],
    };

    if (search) {
      where[Op.and].push({
        [Op.or]: [
          { nama_vendor: { [Op.like]: `%${search}%` } },
          { no_po: { [Op.like]: `%${search}%` } },
          { no_invoice: { [Op.like]: `%${search}%` } },
          { no_invoice_vendor: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (id_vendor) where.id_vendor = id_vendor;

    if (start_date || end_date) {
      const dateFilter = {};
      if (start_date) {
        const startDate = new Date(start_date);
        startDate.setHours(0, 0, 0, 0);
        dateFilter[Op.gte] = startDate;
      }
      if (end_date) {
        const endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
        dateFilter[Op.lte] = endDate;
      }
      where.tgl_faktur = dateFilter;
    }

    const normalizedWaktu = waktu?.trim().toLowerCase();
    if (
      normalizedWaktu &&
      !DUE_TIME_BUCKETS.some(
        (bucket) => bucket.toLowerCase() === normalizedWaktu,
      )
    ) {
      return {
        status: 400,
        success: false,
        message: "filter waktu tidak tersedia",
        pilihan_waktu: DUE_TIME_BUCKETS,
      };
    }

    try {
      const invoices = await InvoiceApModel.findAll({
        attributes: [
          "id",
          "id_vendor",
          "nama_vendor",
          "no_po",
          "no_invoice",
          "no_invoice_vendor",
          "no_surat_jalan",
          "tgl_faktur",
          "tgl_jatuh_tempo",
          "waktu_jatuh_tempo",
          "total",
          "dp",
          "balance_due",
          "paid_amount",
          "status_payment",
          "tgl_pelunasan",
        ],
        where,
        order: [
          ["nama_vendor", "ASC"],
          ["tgl_jatuh_tempo", "ASC"],
          ["createdAt", "ASC"],
        ],
        raw: true,
      });

      const invoicesWithDueDate = invoices.map((invoice) => {
        const outstandingAmount =
          toBigInt(invoice.balance_due) - toBigInt(invoice.paid_amount);
        const dueTime = getInvoiceDueTime(invoice.tgl_jatuh_tempo);

        return {
          ...invoice,
          outstanding_amount: outstandingAmount.toString(),
          days_until_due: dueTime.daysUntilDue,
          due_description: dueTime.dueDescription,
          waktu: dueTime.waktu,
        };
      });

      const dueRecapMap = new Map(
        DUE_TIME_BUCKETS.map((bucket) => [
          bucket,
          {
            waktu: bucket,
            vendorKeys: new Set(),
            total_invoice: 0,
            total_belum_dibayar: 0n,
          },
        ]),
      );

      invoicesWithDueDate.forEach((invoice) => {
        const recap = dueRecapMap.get(invoice.waktu);
        recap.vendorKeys.add(getInvoiceVendorKey(invoice));
        recap.total_invoice += 1;
        recap.total_belum_dibayar += toBigInt(invoice.outstanding_amount);
      });

      const filteredInvoices = normalizedWaktu
        ? invoicesWithDueDate.filter(
            (invoice) => invoice.waktu.toLowerCase() === normalizedWaktu,
          )
        : invoicesWithDueDate;

      const groupedByVendor = new Map();
      let totalBelumDibayar = 0n;

      filteredInvoices.forEach((invoice) => {
        const vendorKey = getInvoiceVendorKey(invoice);
        const outstandingAmount = toBigInt(invoice.outstanding_amount);

        if (!groupedByVendor.has(vendorKey)) {
          groupedByVendor.set(vendorKey, {
            id_vendor: invoice.id_vendor,
            nama_vendor: invoice.nama_vendor,
            total_invoice: 0,
            total_belum_dibayar: 0n,
            invoice: [],
          });
        }

        const vendor = groupedByVendor.get(vendorKey);
        vendor.total_invoice += 1;
        vendor.total_belum_dibayar += outstandingAmount;
        vendor.invoice.push(invoice);
        totalBelumDibayar += outstandingAmount;
      });

      const data = [...groupedByVendor.values()].map((vendor) => ({
        ...vendor,
        total_belum_dibayar: vendor.total_belum_dibayar.toString(),
      }));

      return {
        status: 200,
        success: true,
        data_rekap: {
          total_vendor: data.length,
          total_invoice: filteredInvoices.length,
          total_belum_dibayar: totalBelumDibayar.toString(),
        },
        data_rekap_tenggat: [...dueRecapMap.values()].map((recap) => ({
          waktu: recap.waktu,
          total_vendor: recap.vendorKeys.size,
          total_invoice: recap.total_invoice,
          total_belum_dibayar: recap.total_belum_dibayar.toString(),
        })),
        data,
      };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  // rekap invoice ap approved per vendor berdasarkan range tgl faktur,
  // jika id_vendor diisi ikut detail invoice per vendor
  getInvoiceApRecapByVendorService: async ({
    start_date,
    end_date,
    id_vendor,
    search,
  }) => {
    const dateRange = parseRecapDateRange(start_date, end_date);
    if (dateRange.error) {
      return { status: 400, success: false, message: dateRange.error };
    }

    const where = {
      is_active: true,
      status: "approved",
      status_proses: "done",
      tgl_faktur: {
        [Op.between]: [dateRange.startDate, dateRange.endDate],
      },
    };
    if (id_vendor) where.id_vendor = id_vendor;
    if (search) {
      where.nama_vendor = { [Op.like]: `%${search}%` };
    }

    try {
      const invoices = await InvoiceApModel.findAll({
        attributes: [
          "id",
          "id_vendor",
          "nama_vendor",
          "no_invoice",
          "no_invoice_vendor",
          "tgl_faktur",
          "tgl_jatuh_tempo",
          "tgl_pelunasan",
          "total",
          "balance_due",
          "paid_amount",
          "status_payment",
        ],
        where,
        order: [
          ["nama_vendor", "ASC"],
          ["tgl_faktur", "ASC"],
        ],
        raw: true,
      });

      await fillMissingSettlementDate({
        invoices,
        PaymentDetailModel: InvoiceApPaymentDetail,
        PaymentModel: InvoiceApPayment,
        invoiceIdField: "invoice_ap_id",
      });

      const recapByVendor = new Map();
      const totalRecap = createInvoiceRecap();

      invoices.forEach((invoice) => {
        const vendorKey = getInvoiceVendorKey(invoice);
        if (!recapByVendor.has(vendorKey)) {
          recapByVendor.set(vendorKey, {
            id_vendor: invoice.id_vendor,
            nama_vendor: invoice.nama_vendor,
            ...createInvoiceRecap(),
            ...(id_vendor ? { invoice: [] } : {}),
          });
        }

        const vendorRecap = recapByVendor.get(vendorKey);
        addInvoiceToRecap(vendorRecap, invoice);
        if (id_vendor) {
          vendorRecap.invoice.push({
            ...formatInvoiceRecapDetail(invoice),
            no_invoice_vendor: invoice.no_invoice_vendor,
          });
        }
        addInvoiceToRecap(totalRecap, invoice);
      });

      return {
        status: 200,
        success: true,
        range_tgl_faktur: { start_date, end_date },
        data_rekap: {
          total_vendor: recapByVendor.size,
          ...serializeInvoiceRecap(totalRecap),
        },
        data: [...recapByVendor.values()].map(serializeInvoiceRecap),
      };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  getInvoiceApService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    start_date_faktur,
    end_date_faktur,
    start_date_jatuh_tempo,
    end_date_jatuh_tempo,
    search,
    id_vendor,
    status,
    status_proses,
    status_payment,
    waktu,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const obj = { is_active: true };

    const dateFilters = [
      { field: "createdAt", label: "createdAt", start: start_date, end: end_date },
      {
        field: "tgl_faktur",
        label: "tanggal faktur",
        start: start_date_faktur,
        end: end_date_faktur,
      },
      {
        field: "tgl_jatuh_tempo",
        label: "tanggal jatuh tempo",
        start: start_date_jatuh_tempo,
        end: end_date_jatuh_tempo,
      },
    ];

    for (const filter of dateFilters) {
      const range = buildDateRangeFilter(filter.start, filter.end, filter.label);
      if (range.error) {
        return { status: 400, success: false, message: range.error };
      }
      if (range.value) obj[filter.field] = range.value;
    }

    if (search) {
      obj[Op.or] = [
        { nama_vendor: { [Op.like]: `%${search}%` } },
        { no_po: { [Op.like]: `%${search}%` } },
        { no_invoice: { [Op.like]: `%${search}%` } },
        { no_invoice_vendor: { [Op.like]: `%${search}%` } },
        { no_surat_jalan: { [Op.like]: `%${search}%` } },
      ];
    }
    if (id_vendor) obj.id_vendor = id_vendor;
    if (status) obj.status = status;
    if (status_proses) obj.status_proses = status_proses;
    if (status_payment) obj.status_payment = status_payment;

    const recapWhere = { ...obj };
    const dueDateFilter = getDueTimeDatabaseFilter(waktu);
    if (dueDateFilter.invalid) {
      return {
        status: 400,
        success: false,
        message: "filter waktu tidak tersedia",
        pilihan_waktu: DUE_TIME_BUCKETS,
      };
    }
    if (dueDateFilter.where !== undefined) {
      if (obj.tgl_jatuh_tempo !== undefined) {
        const selectedDueDateRange = obj.tgl_jatuh_tempo;
        delete obj.tgl_jatuh_tempo;
        obj[Op.and] = [
          { tgl_jatuh_tempo: selectedDueDateRange },
          { tgl_jatuh_tempo: dueDateFilter.where },
        ];
      } else {
        obj.tgl_jatuh_tempo = dueDateFilter.where;
      }
    }

    try {
      if (page && limit) {
        const [length, data, rekap] = await Promise.all([
          InvoiceApModel.count({ where: obj }),
          InvoiceApModel.findAll({
            order: [["createdAt", "DESC"]],
            limit: parseInt(limit),
            offset,
            where: obj,
            include: [paymentDetailsInclude],
          }),
          getInvoiceApDueRecap(recapWhere),
        ]);
        return {
          status: 200,
          success: true,
          data_rekap_tenggat: rekap,
          data: data.map(enrichInvoiceWithDueTime),
          total_data: length,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await InvoiceApModel.findByPk(id, {
          include: [
            { model: Users, as: "user_create" },
            { model: Users, as: "user_approve" },
            { model: Users, as: "user_reject" },
            {
              model: InvoiceApItemModel,
              as: "invoice_ap_item",
              where: { is_active: true },
              required: false,
              include: [{ model: GoodReceipt, as: "good_receipt" }],
            },
            paymentDetailsInclude,
          ],
        });
        return { status: 200, success: true, data };
      } else {
        const [data, rekap] = await Promise.all([
          InvoiceApModel.findAll({
            order: [["createdAt", "DESC"]],
            where: obj,
          }),
          getInvoiceApDueRecap(recapWhere),
        ]);
        return {
          status: 200,
          success: true,
          data: data.map(enrichInvoiceWithDueTime),
          data_rekap_tenggat: rekap,
        };
      }
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  // nomor urut reset per tahun, sama seperti invoice ar:
  // pajak (ppn): PI00001/CBL/08/25, non pajak: PI50001-0825
  getNoInvoiceApService: async ({ tgl_faktur } = {}) => {
    try {
      const patokan = tgl_faktur ? new Date(tgl_faktur) : new Date();
      if (isNaN(patokan.getTime())) {
        return { status: 400, success: false, message: "tgl_faktur tidak valid" };
      }

      const currentMonth = String(patokan.getMonth() + 1).padStart(2, "0");
      const shortYear = String(patokan.getFullYear()).slice(2);

      const lastInvoice = await InvoiceApModel.findOne({
        where: { no_invoice: { [Op.like]: `PI%/${shortYear}` } },
        order: [
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_invoice, 3), '/', 1) AS UNSIGNED)`,
            ),
            "DESC",
          ],
          ["createdAt", "DESC"],
        ],
      });

      let nextNumber = 1;
      if (lastInvoice) {
        const lastNo = lastInvoice.no_invoice; // contoh: PI00005/CBL/12/25
        const lastSeq = parseInt(lastNo.substring(2, lastNo.indexOf("/")), 10);
        nextNumber = (lastSeq || 0) + 1;
      }

      const lastInvoiceNonTax = await InvoiceApModel.findOne({
        where: { no_invoice: { [Op.like]: `PI5%-__${shortYear}` } },
        order: [
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_invoice, 4), '-', 1) AS UNSIGNED)`,
            ),
            "DESC",
          ],
          ["createdAt", "DESC"],
        ],
      });

      let nextNumberNonTax = 1;
      if (lastInvoiceNonTax) {
        const lastNo = lastInvoiceNonTax.no_invoice; // contoh: PI50005-1225
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("-")), 10);
        nextNumberNonTax = (lastSeq || 0) + 1;
      }

      const paddedNumber = String(nextNumber).padStart(5, "0");
      const paddedNumberNonTax = String(nextNumberNonTax).padStart(4, "0");
      return {
        status: 200,
        success: true,
        no_invoice_tax: lastInvoice?.no_invoice,
        no_invoice_tax_new: `PI${paddedNumber}/CBL/${currentMonth}/${shortYear}`,
        no_invoice_non_tax: lastInvoiceNonTax?.no_invoice,
        no_invoice_non_tax_new: `PI5${paddedNumberNonTax}-${currentMonth}${shortYear}`,
      };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  createInvoiceApService: async ({
    id_vendor,
    id_create,
    nama_vendor,
    no_invoice,
    no_invoice_vendor,
    no_po,
    no_surat_jalan,
    alamat,
    tgl_faktur,
    tgl_jatuh_tempo,
    waktu_jatuh_tempo,
    sub_total,
    dpp,
    diskon,
    ppn,
    total,
    dp,
    balance_due,
    note,
    is_show_dpp,
    is_tax,
    invoice_ap_item = [],
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!invoice_ap_item || invoice_ap_item.length == 0) {
        throw { status_code: 400, message: "data good receipt tidak boleh kosong" };
      }

      const grIds = invoice_ap_item.map((item) => item.id_good_receipt);
      const dataGr = await lockGoodReceiptForInvoice({ grIds, id_vendor, t });
      const vendorGr = dataGr[0];

      const dataInvoice = await InvoiceApModel.create(
        {
          id_vendor: vendorGr.id_vendor,
          id_create,
          nama_vendor: nama_vendor || vendorGr.nama_vendor,
          no_invoice,
          no_invoice_vendor,
          no_po: no_po ?? joinUnique(dataGr.map((gr) => gr.no_purchase_order)),
          no_surat_jalan:
            no_surat_jalan ?? joinUnique(dataGr.map((gr) => gr.no_surat_jalan)),
          alamat,
          tgl_faktur,
          tgl_jatuh_tempo,
          waktu_jatuh_tempo,
          sub_total,
          dpp,
          diskon,
          ppn,
          total,
          dp: toNominal(dp),
          balance_due,
          note,
          is_show_dpp,
          is_tax,
        },
        { transaction: t },
      );

      const grById = new Map(dataGr.map((gr) => [String(gr.id), gr]));
      await InvoiceApItemModel.bulkCreate(
        invoice_ap_item.map((item) =>
          buildInvoiceApItemPayload(
            dataInvoice.id,
            item,
            grById.get(String(item.id_good_receipt)),
          ),
        ),
        { transaction: t },
      );

      await GoodReceipt.update(
        { is_created_invoice: true, id_invoice_ap: dataInvoice.id },
        { where: { id: grIds }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: dataInvoice,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        success: false,
        status_code: error.status_code || 500,
        message: error.message,
      };
    }
  },

  // item dengan id -> update, tanpa id (id_good_receipt baru) -> tambah,
  // item lama yang tidak dikirim -> nonaktif & gr dilepas lagi ke list gr
  updateInvoiceApService: async ({
    id,
    nama_vendor,
    no_invoice,
    no_invoice_vendor,
    no_po,
    no_surat_jalan,
    alamat,
    tgl_faktur,
    tgl_jatuh_tempo,
    waktu_jatuh_tempo,
    sub_total,
    dpp,
    diskon,
    ppn,
    total,
    dp,
    balance_due,
    note,
    is_show_dpp,
    is_tax,
    invoice_ap_item,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataInvoice = await InvoiceApModel.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!dataInvoice || !dataInvoice.is_active) {
        throw { status_code: 404, message: "data invoice tidak di temukan" };
      }

      await InvoiceApModel.update(
        {
          nama_vendor,
          no_invoice,
          no_invoice_vendor,
          no_po,
          no_surat_jalan,
          alamat,
          tgl_faktur,
          tgl_jatuh_tempo,
          waktu_jatuh_tempo,
          sub_total,
          dpp,
          diskon,
          ppn,
          total,
          dp: dp === undefined || dp === null ? dataInvoice.dp : toNominal(dp),
          balance_due,
          note,
          is_show_dpp,
          is_tax,
        },
        { where: { id }, transaction: t },
      );

      if (invoice_ap_item) {
        if (invoice_ap_item.length == 0) {
          throw { status_code: 400, message: "data good receipt tidak boleh kosong" };
        }

        const existingItems = await InvoiceApItemModel.findAll({
          where: { id_invoice_ap: id, is_active: true },
          transaction: t,
        });
        const existingById = new Map(
          existingItems.map((item) => [String(item.id), item]),
        );

        const newItems = invoice_ap_item.filter(
          (item) => !item.id || !existingById.has(String(item.id)),
        );
        const keptIds = invoice_ap_item
          .filter((item) => item.id && existingById.has(String(item.id)))
          .map((item) => String(item.id));

        // update item lama
        for (const item of invoice_ap_item) {
          const existing = item.id && existingById.get(String(item.id));
          if (!existing) continue;
          await InvoiceApItemModel.update(
            {
              qty: item.qty ?? existing.qty,
              unit: item.unit ?? existing.unit,
              harga: item.harga ?? existing.harga,
              dpp: item.dpp ?? existing.dpp,
              total: item.total ?? existing.total,
              pajak: item.pajak ?? existing.pajak,
              diskon_item: item.diskon_item ?? existing.diskon_item,
            },
            { where: { id: existing.id }, transaction: t },
          );
        }

        // tambah gr baru, vendor harus sama dengan vendor invoice
        if (newItems.length > 0) {
          const grIds = newItems.map((item) => item.id_good_receipt);
          const dataGr = await lockGoodReceiptForInvoice({
            grIds,
            id_vendor: dataInvoice.id_vendor,
            t,
          });
          const grById = new Map(dataGr.map((gr) => [String(gr.id), gr]));
          await InvoiceApItemModel.bulkCreate(
            newItems.map((item) =>
              buildInvoiceApItemPayload(
                id,
                item,
                grById.get(String(item.id_good_receipt)),
              ),
            ),
            { transaction: t },
          );
          await GoodReceipt.update(
            { is_created_invoice: true, id_invoice_ap: id },
            { where: { id: grIds }, transaction: t },
          );
        }

        // item yang dihapus dari invoice
        const removedItems = existingItems.filter(
          (item) => !keptIds.includes(String(item.id)),
        );
        if (removedItems.length > 0) {
          await InvoiceApItemModel.update(
            { is_active: false },
            {
              where: { id: removedItems.map((item) => item.id) },
              transaction: t,
            },
          );
          await releaseGoodReceipt(
            removedItems.map((item) => item.id_good_receipt),
            t,
          );
        }
      }

      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "update success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        success: false,
        status_code: error.status_code || 500,
        message: error.message,
      };
    }
  },

  requestInvoiceApService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataInvoice = await InvoiceApModel.findByPk(id, { transaction: t });
      if (!dataInvoice)
        throw { status_code: 404, message: "data invoice tidak di temukan" };

      await InvoiceApModel.update(
        { status: "requested", status_proses: "requested" },
        { where: { id }, transaction: t },
      );
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "request success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        success: false,
        status_code: error.status_code || 500,
        message: error.message,
      };
    }
  },

  approveInvoiceApService: async ({ id, id_approve, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataInvoice = await InvoiceApModel.findByPk(id, { transaction: t });
      if (!dataInvoice)
        throw { status_code: 404, message: "data invoice tidak di temukan" };

      await InvoiceApModel.update(
        { status: "approved", status_proses: "done", id_approve },
        { where: { id }, transaction: t },
      );
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "approve success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        success: false,
        status_code: error.status_code || 500,
        message: error.message,
      };
    }
  },

  // request banyak invoice ap sekaligus (hanya status draft), semua atau tidak sama sekali
  requestInvoiceApBulkService: async ({ ids, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const listId = normalizeIds(ids);
      const dataInvoices = await getInvoicesForBulk(InvoiceApModel, listId, t);
      validateBulkInvoices(listId, dataInvoices, "draft", "request");

      await InvoiceApModel.update(
        { status: "requested", status_proses: "requested" },
        { where: { id: listId }, transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: `request ${listId.length} invoice success`,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        success: false,
        status_code: error.status_code || 500,
        message: error.message,
        data: error.data,
      };
    }
  },

  // approve banyak invoice ap sekaligus (hanya status requested), semua atau tidak sama sekali
  approveInvoiceApBulkService: async ({
    ids,
    id_approve,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const listId = normalizeIds(ids);
      const dataInvoices = await getInvoicesForBulk(InvoiceApModel, listId, t);
      validateBulkInvoices(listId, dataInvoices, "requested", "approve");

      await InvoiceApModel.update(
        { status: "approved", status_proses: "done", id_approve },
        { where: { id: listId }, transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: `approve ${listId.length} invoice success`,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        success: false,
        status_code: error.status_code || 500,
        message: error.message,
        data: error.data,
      };
    }
  },

  rejectInvoiceApService: async ({ id, id_reject, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataInvoice = await InvoiceApModel.findByPk(id, { transaction: t });
      if (!dataInvoice)
        throw { status_code: 404, message: "data invoice tidak di temukan" };

      await InvoiceApModel.update(
        { status: "draft", status_proses: "rejected", id_reject },
        { where: { id }, transaction: t },
      );
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "reject success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        success: false,
        status_code: error.status_code || 500,
        message: error.message,
      };
    }
  },

  // hapus invoice -> item nonaktif, gr kembali ke list gr (bisa dibuatkan invoice lagi)
  deleteInvoiceApService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const dataInvoice = await InvoiceApModel.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!dataInvoice)
        throw { status_code: 404, message: "data invoice tidak di temukan" };

      if (dataInvoice.is_active) {
        const items = await InvoiceApItemModel.findAll({
          where: { id_invoice_ap: id, is_active: true },
          transaction: t,
        });
        await InvoiceApItemModel.update(
          { is_active: false },
          { where: { id_invoice_ap: id }, transaction: t },
        );
        await releaseGoodReceipt(
          items.map((item) => item.id_good_receipt),
          t,
        );
      }

      await InvoiceApModel.update(
        { is_active: false },
        { where: { id }, transaction: t },
      );
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "delete success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        success: false,
        status_code: error.status_code || 500,
        message: error.message,
      };
    }
  },
};

// ambil & lock gr yang akan dibuatkan invoice:
// harus ada, aktif, belum dibuatkan invoice, dan semuanya vendor yang sama
async function lockGoodReceiptForInvoice({ grIds, id_vendor, t }) {
  if (grIds.some((grId) => !grId)) {
    throw { status_code: 400, message: "id_good_receipt tidak boleh kosong" };
  }
  const uniqueIds = [...new Set(grIds.map(String))];
  if (uniqueIds.length !== grIds.length) {
    throw { status_code: 400, message: "good receipt tidak boleh dobel" };
  }

  const dataGr = await GoodReceipt.findAll({
    where: { id: uniqueIds, is_active: true },
    transaction: t,
    lock: t.LOCK.UPDATE,
  });
  if (dataGr.length !== uniqueIds.length) {
    throw { status_code: 404, message: "data good receipt tidak ditemukan" };
  }

  const sudahInvoice = dataGr.filter((gr) => gr.is_created_invoice);
  if (sudahInvoice.length > 0) {
    throw {
      status_code: 400,
      message: `good receipt ${sudahInvoice
        .map((gr) => gr.no_good_receipt || gr.id)
        .join(", ")} sudah dibuatkan invoice`,
    };
  }

  const vendorIds = new Set(dataGr.map((gr) => String(gr.id_vendor)));
  if (vendorIds.size > 1) {
    throw {
      status_code: 400,
      message: "good receipt yang dipilih harus dari vendor yang sama",
    };
  }
  if (id_vendor && String(dataGr[0].id_vendor) !== String(id_vendor)) {
    throw {
      status_code: 400,
      message: "vendor good receipt tidak sama dengan vendor invoice",
    };
  }

  return dataGr;
}

async function releaseGoodReceipt(grIds, t) {
  const ids = grIds.filter(Boolean);
  if (ids.length === 0) return;
  await GoodReceipt.update(
    { is_created_invoice: false, id_invoice_ap: null },
    { where: { id: ids }, transaction: t },
  );
}

// nilai item dari payload, default dari data gr
function buildInvoiceApItemPayload(id_invoice_ap, item, gr) {
  const qty = item.qty ?? gr.qty;
  const harga = item.harga ?? gr.harga;
  return {
    id_invoice_ap,
    id_good_receipt: gr.id,
    id_item: gr.id_item,
    no_good_receipt: gr.no_good_receipt,
    no_surat_jalan: gr.no_surat_jalan,
    no_purchase_order: gr.no_purchase_order,
    nama_item: item.nama_item ?? gr.nama_item,
    qty,
    unit: item.unit ?? gr.satuan,
    harga,
    dpp: item.dpp ?? null,
    total: item.total ?? Math.round(Number(qty || 0) * Number(harga || 0)),
    pajak: item.pajak ?? null,
    diskon_item: item.diskon_item ?? 0,
  };
}

function joinUnique(values) {
  const unique = [...new Set(values.filter(Boolean))];
  return unique.length > 0 ? unique.join(", ") : null;
}

function toNominal(value) {
  const nominal = Number(value || 0);
  if (!Number.isFinite(nominal)) {
    throw { status_code: 400, message: "dp harus berupa angka" };
  }
  if (nominal < 0) {
    throw { status_code: 400, message: "dp tidak boleh minus" };
  }
  return nominal;
}

async function getInvoiceApDueRecap(where) {
  const invoices = await InvoiceApModel.findAll({
    attributes: ["tgl_jatuh_tempo", "balance_due", "paid_amount"],
    where,
    raw: true,
  });

  const recapMap = new Map(
    DUE_TIME_BUCKETS.map((waktu) => [
      waktu,
      { totalInvoice: 0, totalHarusDibayar: 0n },
    ]),
  );

  invoices.forEach((invoice) => {
    const { waktu } = getInvoiceDueTime(invoice.tgl_jatuh_tempo);
    const outstandingAmount =
      toBigInt(invoice.balance_due) - toBigInt(invoice.paid_amount);
    const recap = recapMap.get(waktu);
    recap.totalInvoice += 1;
    recap.totalHarusDibayar += outstandingAmount > 0n ? outstandingAmount : 0n;
  });

  return [...recapMap.entries()].map(([waktu, recap]) => ({
    waktu,
    total_invoice: recap.totalInvoice,
    total_harus_dibayar: recap.totalHarusDibayar.toString(),
  }));
}

function enrichInvoiceWithDueTime(invoiceModel) {
  const invoice = invoiceModel.toJSON();
  const dueTime = getInvoiceDueTime(invoice.tgl_jatuh_tempo);
  const outstandingAmount =
    toBigInt(invoice.balance_due) - toBigInt(invoice.paid_amount);

  return {
    ...invoice,
    outstanding_amount: (outstandingAmount > 0n
      ? outstandingAmount
      : 0n
    ).toString(),
    days_until_due: dueTime.daysUntilDue,
    due_description: dueTime.dueDescription,
    waktu: dueTime.waktu,
  };
}

function getInvoiceVendorKey(invoice) {
  return invoice.id_vendor
    ? `id:${invoice.id_vendor}`
    : `nama:${(invoice.nama_vendor || "").trim().toLowerCase()}`;
}

module.exports = InvoiceApService;
