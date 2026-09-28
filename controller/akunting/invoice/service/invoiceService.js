const db = require("../../../../config/database");
const { Op, literal } = require("sequelize");
const InvoiceModel = require("../../../../model/akunting/invoice/invoiceModel");
const InvoiceProdukModel = require("../../../../model/akunting/invoice/invoiceProdukModel");
const ReturModel = require("../../../../model/akunting/retur/returModel");
const ReturProdukModel = require("../../../../model/akunting/retur/returProdukModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const DeliveryOrderGroupModel = require("../../../../model/deliveryOrder/deliveryOrderGroupModel");
const Users = require("../../../../model/userModel");
const InvoicePayment = require("../../../../model/akunting/invoice/invoicePaymentModel");
const InvoicePaymentDetail = require("../../../../model/akunting/invoice/invoicePaymentDetailModel");
const InvoicePaymentAdditionalCost = require("../../../../model/akunting/invoice/invoicePaymentAdditionalCostModel");

const InvoiceService = {
  getAccountReceivableService: async ({
    start_date,
    end_date,
    search,
    id_customer,
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
          { nama_customer: { [Op.like]: `%${search}%` } },
          { no_po: { [Op.like]: `%${search}%` } },
          { no_invoice: { [Op.like]: `%${search}%` } },
          { no_do: { [Op.like]: `%${search}%` } },
        ],
      });
    }

    if (id_customer) where.id_customer = id_customer;

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

    try {
      const invoices = await InvoiceModel.findAll({
        attributes: [
          "id",
          "id_customer",
          "nama_customer",
          "no_po",
          "no_invoice",
          "tgl_po",
          "no_do",
          "tgl_kirim",
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
          ["nama_customer", "ASC"],
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
            customerKeys: new Set(),
            total_invoice: 0,
            total_belum_dibayar: 0n,
          },
        ]),
      );

      invoicesWithDueDate.forEach((invoice) => {
        const recap = dueRecapMap.get(invoice.waktu);
        const customerKey = getInvoiceCustomerKey(invoice);
        recap.customerKeys.add(customerKey);
        recap.total_invoice += 1;
        recap.total_belum_dibayar += toBigInt(invoice.outstanding_amount);
      });

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

      const filteredInvoices = normalizedWaktu
        ? invoicesWithDueDate.filter(
            (invoice) => invoice.waktu.toLowerCase() === normalizedWaktu,
          )
        : invoicesWithDueDate;

      const groupedByCustomer = new Map();
      let totalBelumDibayar = 0n;

      filteredInvoices.forEach((invoice) => {
        const customerKey = getInvoiceCustomerKey(invoice);
        const outstandingAmount = toBigInt(invoice.outstanding_amount);

        if (!groupedByCustomer.has(customerKey)) {
          groupedByCustomer.set(customerKey, {
            id_customer: invoice.id_customer,
            nama_customer: invoice.nama_customer,
            total_invoice: 0,
            total_belum_dibayar: 0n,
            invoice: [],
          });
        }

        const customer = groupedByCustomer.get(customerKey);
        customer.total_invoice += 1;
        customer.total_belum_dibayar += outstandingAmount;
        customer.invoice.push(invoice);
        totalBelumDibayar += outstandingAmount;
      });

      const data = [...groupedByCustomer.values()].map((customer) => ({
        ...customer,
        total_belum_dibayar: customer.total_belum_dibayar.toString(),
      }));

      return {
        status: 200,
        success: true,
        data_rekap: {
          total_customer: data.length,
          total_invoice: filteredInvoices.length,
          total_belum_dibayar: totalBelumDibayar.toString(),
        },
        data_rekap_tenggat: [...dueRecapMap.values()].map((recap) => ({
          waktu: recap.waktu,
          total_customer: recap.customerKeys.size,
          total_invoice: recap.total_invoice,
          total_belum_dibayar: recap.total_belum_dibayar.toString(),
        })),
        data,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  getInvoiceRecapByCustomerService: async ({
    start_date,
    end_date,
    id_customer,
    search,
  }) => {
    if (!start_date || !end_date) {
      return {
        status: 400,
        success: false,
        message: "start_date dan end_date wajib diisi",
      };
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return {
        status: 400,
        success: false,
        message: "range tanggal faktur tidak valid",
      };
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    if (startDate > endDate) {
      return {
        status: 400,
        success: false,
        message: "start_date tidak boleh lebih besar dari end_date",
      };
    }

    const where = {
      is_active: true,
      status: "approved",
      status_proses: "done",
      tgl_faktur: { [Op.between]: [startDate, endDate] },
    };
    if (id_customer) where.id_customer = id_customer;
    if (search) {
      where.nama_customer = { [Op.like]: `%${search}%` };
    }

    try {
      const invoices = await InvoiceModel.findAll({
        attributes: [
          "id",
          "id_customer",
          "nama_customer",
          "no_invoice",
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
          ["nama_customer", "ASC"],
          ["tgl_faktur", "ASC"],
        ],
        raw: true,
      });

      const paidInvoiceWithoutSettlementDate = invoices.filter(
        (invoice) =>
          invoice.status_payment === "lunas" && !invoice.tgl_pelunasan,
      );
      if (paidInvoiceWithoutSettlementDate.length > 0) {
        const paymentDetails = await InvoicePaymentDetail.findAll({
          attributes: ["invoice_id"],
          where: {
            invoice_id: {
              [Op.in]: paidInvoiceWithoutSettlementDate.map(
                (invoice) => invoice.id,
              ),
            },
          },
          include: [
            {
              model: InvoicePayment,
              as: "payment",
              attributes: ["payment_date"],
              where: { status: "approved", is_active: true },
              required: true,
            },
          ],
        });

        const lastPaymentDateByInvoice = new Map();
        paymentDetails.forEach((detail) => {
          const paymentDate = detail.payment?.payment_date;
          const currentDate = lastPaymentDateByInvoice.get(
            String(detail.invoice_id),
          );
          if (
            paymentDate &&
            (!currentDate || new Date(paymentDate) > new Date(currentDate))
          ) {
            lastPaymentDateByInvoice.set(
              String(detail.invoice_id),
              paymentDate,
            );
          }
        });

        paidInvoiceWithoutSettlementDate.forEach((invoice) => {
          invoice.tgl_pelunasan = lastPaymentDateByInvoice.get(
            String(invoice.id),
          );
        });
      }

      const recapByCustomer = new Map();
      const totalRecap = createInvoiceRecap();

      invoices.forEach((invoice) => {
        const customerKey = getInvoiceCustomerKey(invoice);
        if (!recapByCustomer.has(customerKey)) {
          recapByCustomer.set(customerKey, {
            id_customer: invoice.id_customer,
            nama_customer: invoice.nama_customer,
            ...createInvoiceRecap(),
            ...(id_customer ? { invoice: [] } : {}),
          });
        }

        const customerRecap = recapByCustomer.get(customerKey);
        addInvoiceToRecap(customerRecap, invoice);
        if (id_customer) {
          customerRecap.invoice.push(formatInvoiceRecapDetail(invoice));
        }
        addInvoiceToRecap(totalRecap, invoice);
      });

      return {
        status: 200,
        success: true,
        range_tgl_faktur: {
          start_date,
          end_date,
        },
        data_rekap: {
          total_customer: recapByCustomer.size,
          ...serializeInvoiceRecap(totalRecap),
        },
        data: [...recapByCustomer.values()].map(serializeInvoiceRecap),
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  getInvoiceService: async ({
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
    id_customer,
    status,
    status_proses,
    status_payment,
    waktu,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const commonWhere = {};

    const dateFilters = [
      {
        field: "createdAt",
        label: "createdAt",
        start: start_date,
        end: end_date,
      },
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
      if (range.value) commonWhere[filter.field] = range.value;
    }

    if (search) {
      commonWhere[Op.or] = [
        { nama_customer: { [Op.like]: `%${search}%` } },
        { no_po: { [Op.like]: `%${search}%` } },
        { no_invoice: { [Op.like]: `%${search}%` } },
        { no_do: { [Op.like]: `%${search}%` } },
      ];
    }
    if (id_customer) commonWhere.id_customer = id_customer;

    const obj = { ...commonWhere };
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
          ...(obj[Op.and] || []),
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
          InvoiceModel.count({ where: obj }),
          InvoiceModel.findAll({
            order: [["createdAt", "DESC"]],
            limit: parseInt(limit),
            offset,
            where: obj,
            include: [
              {
                model: InvoicePaymentDetail,
                as: "payment_details",
                include: [
                  {
                    model: InvoicePayment,
                    as: "payment",
                  },
                  {
                    model: InvoicePaymentAdditionalCost,
                    as: "additional_costs",
                  },
                ],
              },
            ],
          }),
          getInvoiceDueRecap(recapWhere),
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
        const data = await InvoiceModel.findByPk(id, {
          include: [
            {
              model: Users,
              as: "user_create",
            },
            {
              model: Users,
              as: "user_approve",
            },
            {
              model: Users,
              as: "user_reject",
            },
            {
              model: InvoiceProdukModel,
              as: "invoice_produk",
            },
            {
              model: ReturModel,
              as: "retur",
              include: [
                {
                  model: ReturProdukModel,
                  as: "retur_produk",
                },
              ],
            },
            {
              model: InvoicePaymentDetail,
              as: "payment_details",
              include: [
                {
                  model: InvoicePayment,
                  as: "payment",
                },
                {
                  model: InvoicePaymentAdditionalCost,
                  as: "additional_costs",
                },
              ],
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const [data, rekap] = await Promise.all([
          InvoiceModel.findAll({
            order: [["createdAt", "DESC"]],
            where: obj,
          }),
          getInvoiceDueRecap(recapWhere),
        ]);
        return {
          status: 200,
          success: true,
          data: data.map(enrichInvoiceWithDueTime),
          data_rekap_tenggat: rekap,
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

  getNoInvoiceService: async () => {
    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      const lastInvoice = await InvoiceModel.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_invoice, 4), '/', 1) AS UNSIGNED)`,
            ),
            "DESC",
          ],
          ["createdAt", "DESC"],
        ],
      });

      //tentukan no selanjutnya
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
      const shortYear = String(currentYear).slice(2); // 2025 => "25"
      // 2. Tentukan nomor urut berikutnya
      let nextNumber = 1;

      if (lastInvoice) {
        const lastNo = lastInvoice.no_invoice; // contoh: SDP00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        nextNumber = lastSeq + 1;
      }

      // 3. Buat nomor urut padded 5 digit
      const paddedNumber = String(nextNumber).padStart(5, "0");

      // 4. Susun format akhir
      const newInvoiceNumber = `SI${paddedNumber}/CBL/${currentMonth}/${shortYear}`;
      return {
        status: 200,
        success: true,
        no_invoice: lastInvoice?.no_invoice,
        new_no_invoice: newInvoiceNumber,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteInvoiceService: async ({
    id_customer,
    id_create,
    nama_customer,
    no_po,
    no_invoice,
    tgl_po,
    no_do,
    tgl_kirim,
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
    invoice_produk,
    delivery_order_group,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (invoice_produk.length == 0)
        throw {
          status_code: 404,
          success: false,
          message: "data produk tidak boleh kosong",
        };
      const dataInvoice = await InvoiceModel.create(
        {
          id_customer: id_customer,
          id_create: id_create,
          nama_customer: nama_customer,
          no_po: no_po,
          no_invoice: no_invoice,
          tgl_po: tgl_po,
          no_do: no_do,
          tgl_kirim: tgl_kirim,
          alamat: alamat,
          tgl_faktur: tgl_faktur,
          tgl_jatuh_tempo: tgl_jatuh_tempo,
          waktu_jatuh_tempo: waktu_jatuh_tempo,
          sub_total: sub_total,
          dpp: dpp,
          diskon: diskon,
          ppn: ppn,
          total: total,
          dp: dp,
          balance_due: balance_due,
          note: note,
          is_show_dpp: is_show_dpp,
        },
        { transaction: t },
      );

      let dataProdukInvoice = [];
      for (let i = 0; i < invoice_produk.length; i++) {
        const e = invoice_produk[i];
        dataProdukInvoice.push({
          id_invoice: dataInvoice.id,
          id_produk: e.id_produk,
          nama_produk: e.nama_produk,
          kode_produk: e.kode_produk,
          qty: e.qty,
          unit: e.unit,
          harga: e.harga,
          dpp: e.dpp,
          total: e.total,
          pajak: e.pajak,
          diskon_produk: e.diskon_produk,
        });
      }

      await InvoiceProdukModel.bulkCreate(dataProdukInvoice, {
        transaction: t,
      });

      if (delivery_order_group) {
        for (let i = 0; i < delivery_order_group.length; i++) {
          const element = delivery_order_group[i];
          await DeliveryOrderGroupModel.update(
            {
              is_created_invoice: true,
            },
            { where: { id: element.id }, transaction: t },
          );
        }
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  updateInvoiceService: async ({
    id,
    id_customer,
    nama_customer,
    no_po,
    no_invoice,
    tgl_po,
    no_do,
    tgl_kirim,
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
    invoice_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (invoice_produk.length == 0)
        throw {
          status_code: 404,
          success: false,
          message: "data produk tidak boleh kosong",
        };
      const dataInvoice = await InvoiceModel.update(
        {
          id_customer: id_customer,
          nama_customer: nama_customer,
          no_po: no_po,
          no_invoice: no_invoice,
          tgl_po: tgl_po,
          no_do: no_do,
          tgl_kirim: tgl_kirim,
          alamat: alamat,
          tgl_faktur: tgl_faktur,
          tgl_jatuh_tempo: tgl_jatuh_tempo,
          waktu_jatuh_tempo: waktu_jatuh_tempo,
          sub_total: sub_total,
          dpp: dpp,
          diskon: diskon,
          ppn: ppn,
          total: total,
          dp: dp,
          balance_due: balance_due,
          note: note,
          is_show_dpp: is_show_dpp,
        },
        { where: { id: id }, transaction: t },
      );

      for (let i = 0; i < invoice_produk.length; i++) {
        const e = invoice_produk[i];
        await InvoiceProdukModel.update(
          {
            id_produk: e.id_produk,
            nama_produk: e.nama_produk,
            kode_produk: e.kode_produk,
            qty: e.qty,
            unit: e.unit,
            harga: e.harga,
            dpp: e.dpp,
            total: e.total,
            pajak: e.pajak,
            diskon_produk: e.diskon_produk,
          },
          { where: { id: e.id }, transaction: t },
        );
      }

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

  requestInvoiceService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await InvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };
      await InvoiceModel.update(
        {
          status: "requested",
          status_proses: "requested",
        },
        { where: { id: id }, transaction: t },
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

  approveInvoiceService: async ({ id, id_approve, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await InvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };

      await InvoiceModel.update(
        {
          status: "approved",
          status_proses: "done",
          id_approve: id_approve,
        },
        { where: { id: id }, transaction: t },
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

  rejectInvoiceService: async ({ id, id_reject, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await InvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };
      await InvoiceModel.update(
        {
          status: "draft",
          status_proses: "rejected",
          id_reject: id_reject,
        },
        { where: { id: id }, transaction: t },
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

  deleteInvoiceService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataInvoice = await InvoiceModel.findByPk(id);
      if (!getDataInvoice)
        throw {
          success: false,
          status_code: 404,
          message: "data invoice tidak di temukan",
        };
      await InvoiceModel.update(
        {
          is_active: false,
        },
        { where: { id: id }, transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "delete success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

function toBigInt(value) {
  if (value === null || value === undefined || value === "") return 0n;
  return BigInt(String(value).split(".")[0]);
}

function createInvoiceRecap() {
  return {
    total_invoice: 0,
    total_invoice_lunas: 0,
    total_invoice_belum_lunas: 0,
    total_rupiah: 0n,
    total_rupiah_lunas: 0n,
    total_rupiah_belum_lunas: 0n,
    total_invoice_dibayar_tepat_waktu: 0,
    total_invoice_dibayar_telat: 0,
  };
}

function addInvoiceToRecap(recap, invoice) {
  const invoiceAmount = toBigInt(invoice.total ?? invoice.balance_due);
  const isPaid = invoice.status_payment === "lunas";

  recap.total_invoice += 1;
  recap.total_rupiah += invoiceAmount;

  if (!isPaid) {
    recap.total_invoice_belum_lunas += 1;
    recap.total_rupiah_belum_lunas += invoiceAmount;
    return;
  }

  recap.total_invoice_lunas += 1;
  recap.total_rupiah_lunas += invoiceAmount;

  const dueDate = normalizeDate(invoice.tgl_jatuh_tempo);
  const paidDate = normalizeDate(invoice.tgl_pelunasan);
  if (!dueDate || !paidDate) return;

  if (paidDate <= dueDate) {
    recap.total_invoice_dibayar_tepat_waktu += 1;
  } else {
    recap.total_invoice_dibayar_telat += 1;
  }
}

function serializeInvoiceRecap(recap) {
  return {
    ...recap,
    total_rupiah: recap.total_rupiah.toString(),
    total_rupiah_lunas: recap.total_rupiah_lunas.toString(),
    total_rupiah_belum_lunas: recap.total_rupiah_belum_lunas.toString(),
  };
}

function normalizeDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function buildDateRangeFilter(startValue, endValue, label) {
  if (!startValue && !endValue) return { value: undefined };
  if (!startValue || !endValue) {
    return { error: `tanggal awal dan akhir ${label} harus diisi bersamaan` };
  }

  const startDate = new Date(startValue);
  const endDate = new Date(endValue);
  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return { error: `range ${label} tidak valid` };
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  if (startDate > endDate) {
    return { error: `tanggal awal ${label} tidak boleh melebihi tanggal akhir` };
  }

  return { value: { [Op.between]: [startDate, endDate] } };
}

function formatInvoiceRecapDetail(invoice) {
  const balanceDue = toBigInt(invoice.balance_due);
  const paidAmount = toBigInt(invoice.paid_amount);
  const outstandingAmount = balanceDue - paidAmount;
  const dueDate = normalizeDate(invoice.tgl_jatuh_tempo);
  const paidDate = normalizeDate(invoice.tgl_pelunasan);
  let paymentTimeliness = null;

  if (invoice.status_payment === "lunas" && dueDate && paidDate) {
    paymentTimeliness = paidDate <= dueDate ? "tepat waktu" : "terlambat";
  }

  return {
    id: invoice.id,
    no_invoice: invoice.no_invoice,
    tgl_faktur: invoice.tgl_faktur,
    tgl_jatuh_tempo: invoice.tgl_jatuh_tempo,
    tgl_pelunasan: invoice.tgl_pelunasan || null,
    total: invoice.total,
    balance_due: invoice.balance_due,
    paid_amount: invoice.paid_amount,
    outstanding_amount: (
      outstandingAmount > 0n ? outstandingAmount : 0n
    ).toString(),
    status_payment: invoice.status_payment,
    payment_timeliness: paymentTimeliness,
  };
}

async function getInvoiceDueRecap(where) {
  const invoices = await InvoiceModel.findAll({
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
    recap.totalHarusDibayar +=
      outstandingAmount > 0n ? outstandingAmount : 0n;
  });

  return [...recapMap.entries()].map(([waktu, recap]) => ({
    waktu,
    total_invoice: recap.totalInvoice,
    total_harus_dibayar: recap.totalHarusDibayar.toString(),
  }));
}

function getDueTimeDatabaseFilter(waktu) {
  if (!waktu) return { invalid: false, where: undefined };

  const normalizedWaktu = waktu.trim().toLowerCase();
  const selectedBucket = DUE_TIME_BUCKETS.find(
    (bucket) => bucket.toLowerCase() === normalizedWaktu,
  );
  if (!selectedBucket) return { invalid: true };

  if (selectedBucket === "tanpa tenggat waktu") {
    return { invalid: false, where: null };
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  const dayStart = (daysFromToday) => {
    const date = new Date(todayStart);
    date.setDate(date.getDate() + daysFromToday);
    return date;
  };
  const dayEnd = (daysFromToday) => {
    const date = dayStart(daysFromToday);
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const ranges = {
    "1-30 hari lagi": { [Op.between]: [dayStart(1), dayEnd(30)] },
    "31-60 hari lagi": { [Op.between]: [dayStart(31), dayEnd(60)] },
    "61-90 hari lagi": { [Op.between]: [dayStart(61), dayEnd(90)] },
    "lebih dari 90 hari lagi": { [Op.gte]: dayStart(91) },
    "jatuh tempo hari ini": { [Op.between]: [todayStart, todayEnd] },
    "lewat jatuh tempo": { [Op.lt]: todayStart },
  };

  return { invalid: false, where: ranges[selectedBucket] };
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

const DUE_TIME_BUCKETS = [
  "1-30 hari lagi",
  "31-60 hari lagi",
  "61-90 hari lagi",
  "lebih dari 90 hari lagi",
  "jatuh tempo hari ini",
  "lewat jatuh tempo",
  "tanpa tenggat waktu",
];

function getInvoiceDueTime(dueDateValue) {
  if (!dueDateValue) {
    return {
      daysUntilDue: null,
      dueDescription: "tanpa tenggat waktu",
      waktu: "tanpa tenggat waktu",
    };
  }

  const dueDate = new Date(dueDateValue);
  if (Number.isNaN(dueDate.getTime())) {
    return {
      daysUntilDue: null,
      dueDescription: "tanpa tenggat waktu",
      waktu: "tanpa tenggat waktu",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.round(
    (dueDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (daysUntilDue < 0) {
    return {
      daysUntilDue,
      dueDescription: `${Math.abs(daysUntilDue)} hari lewat jatuh tempo`,
      waktu: "lewat jatuh tempo",
    };
  }
  if (daysUntilDue === 0) {
    return {
      daysUntilDue,
      dueDescription: "jatuh tempo hari ini",
      waktu: "jatuh tempo hari ini",
    };
  }
  if (daysUntilDue <= 30) {
    return {
      daysUntilDue,
      dueDescription: `${daysUntilDue} hari lagi`,
      waktu: "1-30 hari lagi",
    };
  }
  if (daysUntilDue <= 60) {
    return {
      daysUntilDue,
      dueDescription: `${daysUntilDue} hari lagi`,
      waktu: "31-60 hari lagi",
    };
  }
  if (daysUntilDue <= 90) {
    return {
      daysUntilDue,
      dueDescription: `${daysUntilDue} hari lagi`,
      waktu: "61-90 hari lagi",
    };
  }

  return {
    daysUntilDue,
    dueDescription: `${daysUntilDue} hari lagi`,
    waktu: "lebih dari 90 hari lagi",
  };
}

function getInvoiceCustomerKey(invoice) {
  return invoice.id_customer
    ? `id:${invoice.id_customer}`
    : `nama:${(invoice.nama_customer || "").trim().toLowerCase()}`;
}

module.exports = InvoiceService;
