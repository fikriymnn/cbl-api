const { Op, literal } = require("sequelize");

// helper bersama invoice ar & invoice ap (nominal, filter tanggal, tenggat jatuh tempo)
function toBigInt(value) {
  if (value === null || value === undefined || value === "") return 0n;
  return BigInt(String(value).split(".")[0]);
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

// rekap invoice (ar per customer / ap per vendor): jumlah & rupiah lunas, belum lunas, tepat waktu, telat
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

// validasi range tanggal faktur rekap (start_date & end_date wajib)
function parseRecapDateRange(start_date, end_date) {
  if (!start_date || !end_date) {
    return { error: "start_date dan end_date wajib diisi" };
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return { error: "range tanggal faktur tidak valid" };
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  if (startDate > endDate) {
    return { error: "start_date tidak boleh lebih besar dari end_date" };
  }
  return { startDate, endDate };
}

// tgl_pelunasan data lama bisa kosong: isi dari tanggal pembayaran approved terakhir
async function fillMissingSettlementDate({
  invoices,
  PaymentDetailModel,
  PaymentModel,
  invoiceIdField,
}) {
  const paidInvoiceWithoutSettlementDate = invoices.filter(
    (invoice) => invoice.status_payment === "lunas" && !invoice.tgl_pelunasan,
  );
  if (paidInvoiceWithoutSettlementDate.length === 0) return;

  const paymentDetails = await PaymentDetailModel.findAll({
    attributes: [invoiceIdField],
    where: {
      [invoiceIdField]: {
        [Op.in]: paidInvoiceWithoutSettlementDate.map((invoice) => invoice.id),
      },
    },
    include: [
      {
        model: PaymentModel,
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
    const invoiceKey = String(detail[invoiceIdField]);
    const currentDate = lastPaymentDateByInvoice.get(invoiceKey);
    if (
      paymentDate &&
      (!currentDate || new Date(paymentDate) > new Date(currentDate))
    ) {
      lastPaymentDateByInvoice.set(invoiceKey, paymentDate);
    }
  });

  paidInvoiceWithoutSettlementDate.forEach((invoice) => {
    invoice.tgl_pelunasan = lastPaymentDateByInvoice.get(String(invoice.id));
  });
}

// nomor bukti pembayaran invoice ar & ap, nomor urut reset per tahun (patokan tanggal bayar)
// pajak: KT00001/CBL/10/26, non pajak: KT50001-1026
const RECEIPT_NUMBER_TAX_REGEX = /^KT\d{5}\/CBL\/\d{2}\/\d{2}$/;
const RECEIPT_NUMBER_NON_TAX_REGEX = /^KT5\d{4}-\d{4}$/;

async function getPaymentReceiptNumber(PaymentModel, payment_date) {
  const patokan = payment_date ? new Date(payment_date) : new Date();
  if (Number.isNaN(patokan.getTime())) {
    return { error: "payment_date tidak valid" };
  }

  const currentMonth = String(patokan.getMonth() + 1).padStart(2, "0");
  const shortYear = String(patokan.getFullYear()).slice(2);

  const lastPaymentTax = await PaymentModel.findOne({
    attributes: ["receipt_number"],
    where: { receipt_number: { [Op.like]: `KT%/${shortYear}` } },
    order: [
      [
        literal(
          "CAST(SUBSTRING_INDEX(SUBSTRING(receipt_number, 3), '/', 1) AS UNSIGNED)",
        ),
        "DESC",
      ],
      ["createdAt", "DESC"],
    ],
  });
  const lastTax = lastPaymentTax?.receipt_number || null;
  const nextTax = lastTax
    ? (parseInt(lastTax.substring(2, lastTax.indexOf("/")), 10) || 0) + 1
    : 1;

  const lastPaymentNonTax = await PaymentModel.findOne({
    attributes: ["receipt_number"],
    where: { receipt_number: { [Op.like]: `KT5%-__${shortYear}` } },
    order: [
      [
        literal(
          "CAST(SUBSTRING_INDEX(SUBSTRING(receipt_number, 4), '-', 1) AS UNSIGNED)",
        ),
        "DESC",
      ],
      ["createdAt", "DESC"],
    ],
  });
  const lastNonTax = lastPaymentNonTax?.receipt_number || null;
  const nextNonTax = lastNonTax
    ? (parseInt(lastNonTax.substring(3, lastNonTax.indexOf("-")), 10) || 0) + 1
    : 1;

  return {
    receipt_number_tax: lastTax,
    receipt_number_tax_new: `KT${String(nextTax).padStart(5, "0")}/CBL/${currentMonth}/${shortYear}`,
    receipt_number_non_tax: lastNonTax,
    receipt_number_non_tax_new: `KT5${String(nextNonTax).padStart(4, "0")}-${currentMonth}${shortYear}`,
  };
}

function parseIsTax(value) {
  if (value === true || value === 1 || value === "true" || value === "1") {
    return true;
  }
  if (value === false || value === 0 || value === "false" || value === "0") {
    return false;
  }
  return null;
}

// receipt_number dari client wajib sesuai format is_tax (pajak / non pajak) dan belum dipakai
async function validatePaymentReceiptNumber(
  PaymentModel,
  receipt_number,
  is_tax,
  transaction,
) {
  const isTax = parseIsTax(is_tax);
  if (isTax === null) {
    throw { status_code: 400, message: "is_tax wajib diisi (true / false)" };
  }

  const receiptNumber = String(receipt_number ?? "").trim();
  if (!receiptNumber) {
    throw { status_code: 400, message: "nomor bukti pembayaran wajib diisi" };
  }
  if (isTax && !RECEIPT_NUMBER_TAX_REGEX.test(receiptNumber)) {
    throw {
      status_code: 400,
      message:
        "format nomor bukti pembayaran pajak tidak valid, contoh: KT00001/CBL/10/26",
    };
  }
  if (!isTax && !RECEIPT_NUMBER_NON_TAX_REGEX.test(receiptNumber)) {
    throw {
      status_code: 400,
      message:
        "format nomor bukti pembayaran non pajak tidak valid, contoh: KT50001-1026",
    };
  }

  const existing = await PaymentModel.findOne({
    attributes: ["id"],
    where: { receipt_number: receiptNumber },
    transaction,
  });
  if (existing) {
    throw {
      status_code: 400,
      message: `nomor bukti pembayaran ${receiptNumber} sudah digunakan`,
    };
  }
  return { receiptNumber, isTax };
}

// bulk request/approve: ids wajib array tidak kosong, duplikat dibuang
function normalizeIds(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw { status_code: 400, message: "ids wajib diisi (array id invoice)" };
  }

  const listId = [...new Set(ids.map((id) => Number(id)))];
  if (listId.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw { status_code: 400, message: "ids berisi id yang tidak valid" };
  }
  return listId;
}

function getInvoicesForBulk(Model, listId, transaction) {
  return Model.findAll({
    where: { id: listId },
    attributes: ["id", "no_invoice", "status", "is_active"],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
}

// semua invoice harus ada, aktif, dan berstatus sesuai; jika ada yang gagal seluruh proses dibatalkan
function validateBulkInvoices(listId, dataInvoices, requiredStatus, action) {
  const foundIds = new Set(dataInvoices.map((invoice) => invoice.id));
  const notFound = listId.filter((id) => !foundIds.has(id));
  if (notFound.length) {
    throw {
      status_code: 404,
      message: `data invoice tidak di temukan: ${notFound.join(", ")}`,
      data: { not_found: notFound },
    };
  }

  const invalid = dataInvoices
    .filter((invoice) => !invoice.is_active || invoice.status !== requiredStatus)
    .map((invoice) => ({
      id: invoice.id,
      no_invoice: invoice.no_invoice,
      status: invoice.is_active ? invoice.status : "nonaktif",
    }));
  if (invalid.length) {
    throw {
      status_code: 400,
      message: `invoice yang bisa di ${action} hanya yang berstatus ${requiredStatus}: ${invalid
        .map((invoice) => invoice.no_invoice || invoice.id)
        .join(", ")}`,
      data: { invalid },
    };
  }
}

module.exports = {
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
  getPaymentReceiptNumber,
  validatePaymentReceiptNumber,
  parseIsTax,
  normalizeIds,
  getInvoicesForBulk,
  validateBulkInvoices,
};
