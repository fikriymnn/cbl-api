const db = require("../../../../config/database");
const { Op, literal } = require("sequelize");
const InvoiceModel = require("../../../../model/akunting/invoice/invoiceModel");
const Users = require("../../../../model/userModel");
const InvoicePayment = require("../../../../model/akunting/invoice/invoicePaymentModel");
const InvoicePaymentDetail = require("../../../../model/akunting/invoice/invoicePaymentDetailModel");
const InvoicePaymentAdditionalCost = require("../../../../model/akunting/invoice/invoicePaymentAdditionalCostModel");
const DepositService = require("../../deposit/service/depositService");

const InvoicePaymentService = {
  getInvoicePaymentService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    customer_id,
    status,
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
    if (status) where.status = status;

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
        { model: Users, as: "approved_user", attributes: ["id", "nama"] },
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
                "tgl_pelunasan",
              ],
            },
            {
              model: InvoicePaymentAdditionalCost,
              as: "additional_costs",
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

      const allocations = invoices.map((item) => {
        const additionalCosts = item.additional_costs || [];
        if (!Array.isArray(additionalCosts)) {
          throwPaymentError(
            400,
            `biaya tambahan invoice ${item.invoice_id} harus berupa array`,
          );
        }

        return {
          invoice_id: item.invoice_id,
          payment_amount: parsePaymentAmount(
            item.payment_amount,
            `jumlah bayar invoice ${item.invoice_id}`,
          ),
          additional_costs: additionalCosts.map((cost, index) => {
            if (!cost.name || !String(cost.name).trim()) {
              throwPaymentError(
                400,
                `nama biaya tambahan ke-${index + 1} invoice ${item.invoice_id} wajib diisi`,
              );
            }
            return {
              name: String(cost.name).trim(),
              amount: parsePaymentAmount(
                cost.amount,
                `jumlah biaya tambahan ${cost.name}`,
              ),
              note: cost.note || null,
            };
          }),
        };
      });
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
        const effectivePayment =
          allocation.payment_amount + sumAdditionalCosts(allocation);
        if (effectivePayment > remainingAmount) {
          throwPaymentError(
            400,
            `jumlah bayar dan biaya tambahan invoice ${selectedInvoice.no_invoice} melebihi sisa tagihan`,
          );
        }
      });

      const isAutoApproved = totalPayment === totalAllocation;

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
          status: isAutoApproved ? "approved" : "requested",
          id_approve: isAutoApproved ? created_by : null,
        },
        { transaction: t },
      );

      for (const allocation of allocations) {
        const detail = await InvoicePaymentDetail.create(
          {
            invoice_payment_id: payment.id,
            invoice_id: allocation.invoice_id,
            payment_amount: allocation.payment_amount.toString(),
          },
          { transaction: t },
        );

        if (allocation.additional_costs.length > 0) {
          await InvoicePaymentAdditionalCost.bulkCreate(
            allocation.additional_costs.map((cost) => ({
              invoice_payment_detail_id: detail.id,
              name: cost.name,
              amount: cost.amount.toString(),
              note: cost.note,
            })),
            { transaction: t },
          );
        }
      }

      if (isAutoApproved) {
        await applyInvoicePayment({
          payment,
          allocations,
          invoiceById,
          transaction: t,
        });
      }

      if (!transaction) await t.commit();
      return {
        status: 200,
        success: true,
        message: isAutoApproved
          ? "pembayaran invoice berhasil dan langsung disetujui"
          : "pembayaran invoice berhasil dibuat dan menunggu persetujuan",
        data: {
          id: payment.id,
          receipt_number: payment.receipt_number,
          payment_amount: payment.payment_amount,
          payment_amount_use: payment.payment_amount_use,
          status: payment.status,
          id_approve: payment.id_approve,
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

  approveInvoicePaymentService: async ({
    id,
    id_approve,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const payment = await InvoicePayment.findByPk(id, {
        include: [
          {
            model: InvoicePaymentDetail,
            as: "payment_details",
            include: [
              {
                model: InvoicePaymentAdditionalCost,
                as: "additional_costs",
              },
            ],
          },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!payment || !payment.is_active) {
        throwPaymentError(404, "pembayaran invoice tidak ditemukan");
      }
      if (payment.status !== "requested") {
        throwPaymentError(
          400,
          `pembayaran invoice berstatus ${payment.status} dan tidak dapat disetujui`,
        );
      }
      if (!payment.payment_details || payment.payment_details.length === 0) {
        throwPaymentError(400, "detail pembayaran invoice tidak ditemukan");
      }

      const allocations = payment.payment_details.map((detail) => ({
        invoice_id: detail.invoice_id,
        payment_amount: toBigInt(detail.payment_amount),
        additional_costs: detail.additional_costs.map((cost) => ({
          amount: toBigInt(cost.amount),
        })),
      }));
      const invoiceIds = allocations.map((item) => item.invoice_id);
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
      validatePaymentApplication(allocations, invoiceById);
      await applyInvoicePayment({
        payment,
        allocations,
        invoiceById,
        transaction: t,
      });

      const unusedAmount =
        toBigInt(payment.payment_amount) -
        toBigInt(payment.payment_amount_use);
      if (unusedAmount < 0n) {
        throwPaymentError(
          400,
          "jumlah pembayaran terpakai melebihi jumlah pembayaran",
        );
      }

      let deposit = null;
      if (unusedAmount > 0n) {
        const depositResult =
          await DepositService.createApprovedDepositFromInvoicePaymentService({
            customer_id: payment.customer_id,
            id_create: payment.created_by,
            id_approve,
            nominal: unusedAmount.toString(),
            payment_method: payment.payment_method,
            payment_date: payment.payment_date,
            receipt_number: payment.receipt_number,
            transaction: t,
          });
        deposit = depositResult.data;
      }

      await payment.update(
        { status: "approved", id_approve },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status: 200,
        success: true,
        message: deposit
          ? "pembayaran invoice berhasil disetujui dan sisa pembayaran menjadi deposit"
          : "pembayaran invoice berhasil disetujui",
        data: {
          id: payment.id,
          status: "approved",
          id_approve,
          unused_amount: unusedAmount.toString(),
          deposit,
        },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        status_code: error.status_code || 500,
        success: false,
        message: error.message || "persetujuan pembayaran invoice gagal",
      };
    }
  },
};

function toBigInt(value) {
  if (value === null || value === undefined || value === "") return 0n;
  return BigInt(String(value).split(".")[0]);
}

function sumAdditionalCosts(allocation) {
  return (allocation.additional_costs || []).reduce(
    (total, cost) => total + toBigInt(cost.amount),
    0n,
  );
}

function validatePaymentApplication(allocations, invoiceById) {
  allocations.forEach((allocation) => {
    const invoice = invoiceById.get(String(allocation.invoice_id));
    if (!invoice) {
      throwPaymentError(404, `invoice ${allocation.invoice_id} tidak ditemukan`);
    }
    if (
      !invoice.is_active ||
      invoice.status !== "approved" ||
      invoice.status_proses !== "done"
    ) {
      throwPaymentError(400, `invoice ${invoice.no_invoice} belum dapat dibayar`);
    }

    const remainingAmount =
      toBigInt(invoice.balance_due) - toBigInt(invoice.paid_amount);
    const effectivePayment =
      toBigInt(allocation.payment_amount) + sumAdditionalCosts(allocation);
    if (remainingAmount <= 0n || invoice.status_payment === "lunas") {
      throwPaymentError(400, `invoice ${invoice.no_invoice} sudah lunas`);
    }
    if (effectivePayment > remainingAmount) {
      throwPaymentError(
        400,
        `jumlah bayar dan biaya tambahan invoice ${invoice.no_invoice} melebihi sisa tagihan`,
      );
    }
  });
}

async function applyInvoicePayment({
  payment,
  allocations,
  invoiceById,
  transaction,
}) {
  for (const allocation of allocations) {
    const invoice = invoiceById.get(String(allocation.invoice_id));
    const effectivePayment =
      toBigInt(allocation.payment_amount) + sumAdditionalCosts(allocation);
    const newPaidAmount = toBigInt(invoice.paid_amount) + effectivePayment;
    const isPaid = newPaidAmount === toBigInt(invoice.balance_due);

    await invoice.update(
      {
        paid_amount: newPaidAmount.toString(),
        status_payment: isPaid ? "lunas" : "belum lunas",
        tgl_pelunasan: isPaid ? payment.payment_date : null,
      },
      { transaction },
    );
  }
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

module.exports = InvoicePaymentService;
