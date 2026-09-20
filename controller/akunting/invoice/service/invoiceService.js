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

const InvoiceService = {
  getInvoicePaymentService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    customer_id,
  }) => {
    const where = { is_active: true };

    if (search) {
      where[Op.or] = [
        { receipt_number: { [Op.like]: `%${search}%` } },
        { payment_method: { [Op.like]: `%${search}%` } },
        { bank: { [Op.like]: `%${search}%` } },
        { account_number: { [Op.like]: `%${search}%` } },
      ];
    }
    if (customer_id) where.customer_id = customer_id;

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
      where.payment_date = dateFilter;
    }

    const options = {
      where,
      order: [["createdAt", "DESC"]],
      include: [
        { model: Users, as: "created_user", attributes: ["id", "nama"] },
        {
          model: InvoicePaymentDetail,
          as: "payment_details",
          include: [
            {
              model: InvoiceModel,
              as: "invoice",
              attributes: [
                "id",
                "no_invoice",
                "nama_customer",
                "total",
                "balance_due",
                "paid_amount",
                "status_payment",
              ],
            },
          ],
        },
      ],
    };

    try {
      if (id) {
        const data = await InvoicePayment.findOne({
          ...options,
          where: { ...where, id },
        });

        return {
          status: 200,
          success: true,
          data,
        };
      }

      if ((page && !limit) || (!page && limit)) {
        return {
          status: 400,
          success: false,
          message: "page dan limit harus diisi bersamaan",
        };
      }

      if (page && limit) {
        const parsedPage = Number(page);
        const parsedLimit = Number(limit);
        if (
          !Number.isInteger(parsedPage) ||
          parsedPage < 1 ||
          !Number.isInteger(parsedLimit) ||
          parsedLimit < 1
        ) {
          return {
            status: 400,
            success: false,
            message: "page dan limit harus berupa angka lebih besar dari 0",
          };
        }

        const totalData = await InvoicePayment.count({ where });
        const data = await InvoicePayment.findAll({
          ...options,
          limit: parsedLimit,
          offset: (parsedPage - 1) * parsedLimit,
        });

        return {
          status: 200,
          success: true,
          data,
          total_data: totalData,
          total_page: Math.ceil(totalData / parsedLimit),
        };
      }

      const data = await InvoicePayment.findAll(options);

      return {
        status: 200,
        success: true,
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

  getNoInvoicePaymentService: async () => {
    try {
      const paymentNumber = await generateInvoicePaymentNumber();
      return {
        status: 200,
        success: true,
        receipt_number: paymentNumber.lastNumber,
        new_receipt_number: paymentNumber.nextNumber,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  createInvoicePaymentService: async ({
    customer_id,
    created_by,
    payment_amount,
    payment_proof,
    payment_date,
    payment_method,
    bank,
    account_number,
    note,
    invoices,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!customer_id) {
        throwPaymentError(400, "customer wajib diisi");
      }
      if (!payment_date) {
        throwPaymentError(400, "tanggal bayar wajib diisi");
      }
      if (!payment_proof || !String(payment_proof).trim()) {
        throwPaymentError(400, "bukti pembayaran wajib diisi");
      }
      if (Number.isNaN(new Date(payment_date).getTime())) {
        throwPaymentError(400, "tanggal bayar tidak valid");
      }
      if (!payment_method) {
        throwPaymentError(400, "cara bayar wajib diisi");
      }
      if (!Array.isArray(invoices) || invoices.length === 0) {
        throwPaymentError(400, "invoice yang dibayar tidak boleh kosong");
      }

      const totalPayment = parsePaymentAmount(payment_amount, "jumlah bayar");
      const invoiceIds = invoices.map((item) => item.invoice_id);
      if (invoiceIds.some((id) => !id)) {
        throwPaymentError(400, "id invoice wajib diisi");
      }
      if (new Set(invoiceIds.map(String)).size !== invoiceIds.length) {
        throwPaymentError(400, "invoice tidak boleh duplikat");
      }

      const allocations = invoices.map((item) => ({
        invoice_id: item.invoice_id,
        payment_amount: parsePaymentAmount(
          item.payment_amount,
          `jumlah bayar invoice ${item.invoice_id}`,
        ),
      }));
      const totalAllocation = allocations.reduce(
        (total, item) => total + item.payment_amount,
        0n,
      );

      if (totalAllocation > totalPayment) {
        throwPaymentError(
          400,
          "total pembayaran yang digunakan tidak boleh melebihi jumlah bayar bukti penerimaan",
        );
      }

      const invoiceData = await InvoiceModel.findAll({
        where: { id: { [Op.in]: invoiceIds } },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (invoiceData.length !== invoiceIds.length) {
        throwPaymentError(404, "salah satu invoice tidak ditemukan");
      }

      const invoiceById = new Map(
        invoiceData.map((item) => [String(item.id), item]),
      );

      allocations.forEach((allocation) => {
        const selectedInvoice = invoiceById.get(String(allocation.invoice_id));

        if (String(selectedInvoice.id_customer) !== String(customer_id)) {
          throwPaymentError(
            400,
            `invoice ${selectedInvoice.no_invoice} bukan milik customer yang dipilih`,
          );
        }
        if (
          !selectedInvoice.is_active ||
          selectedInvoice.status !== "approved" ||
          selectedInvoice.status_proses !== "done"
        ) {
          throwPaymentError(
            400,
            `invoice ${selectedInvoice.no_invoice} belum dapat dibayar`,
          );
        }

        const remainingAmount =
          toBigInt(selectedInvoice.balance_due) -
          toBigInt(selectedInvoice.paid_amount);
        if (
          remainingAmount <= 0n ||
          selectedInvoice.status_payment === "lunas"
        ) {
          throwPaymentError(
            400,
            `invoice ${selectedInvoice.no_invoice} sudah lunas`,
          );
        }
        if (allocation.payment_amount > remainingAmount) {
          throwPaymentError(
            400,
            `jumlah bayar invoice ${selectedInvoice.no_invoice} melebihi sisa tagihan`,
          );
        }
      });

      const paymentNumber = await generateInvoicePaymentNumber(t);
      const payment = await InvoicePayment.create(
        {
          customer_id,
          created_by,
          receipt_number: paymentNumber.nextNumber,
          payment_amount: totalPayment.toString(),
          payment_amount_use: totalAllocation.toString(),
          payment_proof,
          payment_date,
          payment_method,
          bank,
          account_number,
          note,
        },
        { transaction: t },
      );

      await InvoicePaymentDetail.bulkCreate(
        allocations.map((allocation) => ({
          invoice_payment_id: payment.id,
          invoice_id: allocation.invoice_id,
          payment_amount: allocation.payment_amount.toString(),
        })),
        { transaction: t },
      );

      for (const allocation of allocations) {
        const selectedInvoice = invoiceById.get(String(allocation.invoice_id));
        const newPaidAmount =
          toBigInt(selectedInvoice.paid_amount) + allocation.payment_amount;
        const isPaid = newPaidAmount === toBigInt(selectedInvoice.balance_due);

        await selectedInvoice.update(
          {
            paid_amount: newPaidAmount.toString(),
            status_payment: isPaid ? "lunas" : "belum lunas",
          },
          { transaction: t },
        );
      }

      if (!transaction) await t.commit();
      return {
        status: 200,
        success: true,
        message: "pembayaran invoice berhasil",
        data: {
          id: payment.id,
          receipt_number: payment.receipt_number,
          payment_amount: payment.payment_amount,
          payment_amount_use: payment.payment_amount_use,
        },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        status_code: error.status_code || 500,
        success: false,
        message: error.message || "pembayaran invoice gagal",
      };
    }
  },

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

  getInvoiceService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_customer,
    status,
    status_proses,
    waktu,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const commonWhere = {};
    if (search) {
      commonWhere[Op.or] = [
        { nama_customer: { [Op.like]: `%${search}%` } },
        { no_po: { [Op.like]: `%${search}%` } },
        { no_invoice: { [Op.like]: `%${search}%` } },
        { no_do: { [Op.like]: `%${search}%` } },
      ];
    }
    if (id_customer) commonWhere.id_customer = id_customer;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      commonWhere.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const obj = { ...commonWhere };
    if (status) obj.status = status;
    if (status_proses) obj.status_proses = status_proses;

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
      obj.tgl_jatuh_tempo = dueDateFilter.where;
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

function parsePaymentAmount(value, fieldName) {
  const normalizedValue = String(value ?? "").trim();
  if (!/^\d+$/.test(normalizedValue) || BigInt(normalizedValue) <= 0n) {
    throwPaymentError(400, `${fieldName} harus lebih besar dari 0`);
  }
  return BigInt(normalizedValue);
}

function throwPaymentError(statusCode, message) {
  throw { status_code: statusCode, success: false, message };
}

async function generateInvoicePaymentNumber(transaction = null) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const options = {
    attributes: ["receipt_number"],
    where: {
      createdAt: { [Op.between]: [startOfYear, endOfYear] },
    },
    order: [
      [
        literal(
          "CAST(SUBSTRING_INDEX(SUBSTRING(receipt_number, 3), '/', 1) AS UNSIGNED)",
        ),
        "DESC",
      ],
      ["createdAt", "DESC"],
    ],
  };

  if (transaction) {
    options.transaction = transaction;
    options.lock = transaction.LOCK.UPDATE;
  }

  const lastPayment = await InvoicePayment.findOne(options);
  const lastNumber = lastPayment?.receipt_number || null;
  const lastSequence = lastNumber
    ? parseInt(lastNumber.slice(2, lastNumber.indexOf("/")), 10) || 0
    : 0;
  const nextSequence = String(lastSequence + 1).padStart(5, "0");
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const shortYear = String(now.getFullYear()).slice(2);

  return {
    lastNumber,
    nextNumber: `BB${nextSequence}/CBL/${currentMonth}/${shortYear}`,
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
