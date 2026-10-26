const db = require("../../../../config/database");
const { Op, literal } = require("sequelize");
const DepositVendorModel = require("../../../../model/akunting/depositVendor/depositVendorModel");
const MasterVendor = require("../../../../model/masterData/marketing/masterVendorModel");
const Users = require("../../../../model/userModel");

// deposit vendor: input manual atau sisa lebih bayar invoice ap payment,
// saldo vendor bertambah saat deposit approved
const DepositVendorService = {
  getDepositVendorService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_vendor,
    status,
  }) => {
    const where = { is_active: true };
    if (search) {
      where[Op.or] = [
        { no_deposit: { [Op.like]: `%${search}%` } },
        { cara_bayar: { [Op.like]: `%${search}%` } },
        { note: { [Op.like]: `%${search}%` } },
      ];
    }
    if (id_vendor) where.id_vendor = id_vendor;
    if (status) where.status = status;
    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const include = [
      { model: MasterVendor, as: "vendor", attributes: ["id", "nama_vendor"] },
      { model: Users, as: "user_create", attributes: ["id", "nama"] },
      { model: Users, as: "user_approve", attributes: ["id", "nama"] },
      { model: Users, as: "user_reject", attributes: ["id", "nama"] },
    ];

    try {
      if (id) {
        const data = await DepositVendorModel.findOne({
          where: { ...where, id },
          include,
        });
        return { status: 200, success: true, data };
      }

      if (page && limit) {
        const parsedLimit = parseInt(limit);
        const length = await DepositVendorModel.count({ where });
        const data = await DepositVendorModel.findAll({
          order: [["createdAt", "DESC"]],
          limit: parsedLimit,
          offset: (parseInt(page) - 1) * parsedLimit,
          where,
          include,
        });
        return {
          status: 200,
          success: true,
          data,
          total_data: length,
          total_page: Math.ceil(length / parsedLimit),
        };
      }

      const data = await DepositVendorModel.findAll({
        order: [["createdAt", "DESC"]],
        where,
        include,
      });
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  getSaldoVendorService: async ({ id_vendor }) => {
    try {
      if (id_vendor) {
        const data = await MasterVendor.findByPk(id_vendor, {
          attributes: ["id", "nama_vendor", "saldo"],
        });
        if (!data) {
          return {
            status: 404,
            success: false,
            message: "data vendor tidak ditemukan",
          };
        }
        return { status: 200, success: true, data };
      }

      // tanpa id_vendor: list vendor yang saldonya masih ada
      const data = await MasterVendor.findAll({
        attributes: ["id", "nama_vendor", "saldo"],
        where: { saldo: { [Op.gt]: 0 } },
        order: [["saldo", "DESC"]],
      });
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  getNoDepositVendorService: async () => {
    try {
      const depositNumber = await generateDepositVendorNumber();
      return {
        status: 200,
        success: true,
        no_deposit: depositNumber.lastNumber,
        new_no_deposit: depositNumber.nextNumber,
      };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  createDepositVendorService: async ({
    id_vendor,
    id_create,
    no_deposit,
    cara_bayar,
    billing_address,
    tgl_faktur,
    nominal,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!id_vendor) throwDepositError(400, "vendor wajib diisi");
      const amount = parseNominal(nominal);

      const vendor = await MasterVendor.findByPk(id_vendor, { transaction: t });
      if (!vendor) throwDepositError(404, "data vendor tidak ditemukan");

      // nomor dari client dipakai jika ada, selain itu generate di server
      const depositNumber = no_deposit
        ? null
        : await generateDepositVendorNumber(t);
      const deposit = await DepositVendorModel.create(
        {
          id_vendor,
          id_create,
          no_deposit: no_deposit || depositNumber.nextNumber,
          cara_bayar,
          billing_address,
          tgl_faktur,
          nominal: amount,
          note,
        },
        { transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: { id: deposit.id, no_deposit: deposit.no_deposit },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },

  updateDepositVendorService: async ({
    id,
    id_vendor,
    no_deposit,
    cara_bayar,
    billing_address,
    tgl_faktur,
    nominal,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const deposit = await findActiveDeposit(id, t);
      if (deposit.status !== "draft") {
        throwDepositError(
          400,
          `deposit vendor berstatus ${deposit.status} dan tidak dapat diubah`,
        );
      }
      if (id_vendor) {
        const vendor = await MasterVendor.findByPk(id_vendor, {
          transaction: t,
        });
        if (!vendor) throwDepositError(404, "data vendor tidak ditemukan");
      }

      // field yang tidak dikirim tidak ikut diubah
      const payload = Object.fromEntries(
        Object.entries({
          id_vendor,
          no_deposit,
          cara_bayar,
          billing_address,
          tgl_faktur,
          nominal: nominal !== undefined ? parseNominal(nominal) : undefined,
          note,
        }).filter(([, value]) => value !== undefined),
      );
      await deposit.update(payload, { transaction: t });
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "update success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },

  requestDepositVendorService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const deposit = await findActiveDeposit(id, t);
      if (deposit.status !== "draft") {
        throwDepositError(
          400,
          `deposit vendor berstatus ${deposit.status} dan tidak dapat di request`,
        );
      }

      await deposit.update(
        { status: "requested", status_proses: "requested" },
        { transaction: t },
      );
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "request success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },

  approveDepositVendorService: async ({ id, id_approve, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const deposit = await findActiveDeposit(id, t);
      // cegah approve 2x yang membuat saldo bertambah dobel
      if (deposit.status !== "requested") {
        throwDepositError(
          400,
          `deposit vendor berstatus ${deposit.status} dan tidak dapat di approve`,
        );
      }

      const vendor = await MasterVendor.findByPk(deposit.id_vendor, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!vendor) throwDepositError(404, "data vendor tidak ditemukan");

      await deposit.update(
        { status: "approved", status_proses: "done", id_approve },
        { transaction: t },
      );
      // jangan pakai increment: di SQL NULL + x = NULL, saldo vendor lama masih NULL
      await vendor.update(
        { saldo: Number(vendor.saldo || 0) + Number(deposit.nominal || 0) },
        { transaction: t },
      );
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "approve success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },

  rejectDepositVendorService: async ({
    id,
    id_reject,
    note_reject,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const deposit = await findActiveDeposit(id, t);
      if (deposit.status !== "requested") {
        throwDepositError(
          400,
          `deposit vendor berstatus ${deposit.status} dan tidak dapat di reject`,
        );
      }

      await deposit.update(
        {
          status: "draft",
          status_proses: "rejected",
          id_reject,
          note_reject,
        },
        { transaction: t },
      );
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "reject success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },

  deleteDepositVendorService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const deposit = await findActiveDeposit(id, t);
      // deposit approved sudah masuk ke saldo vendor
      if (deposit.status === "approved") {
        throwDepositError(
          400,
          "deposit vendor yang sudah di approve tidak dapat dihapus",
        );
      }

      await deposit.update({ is_active: false }, { transaction: t });
      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "delete success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },

  createApprovedDepositVendorFromInvoiceApPaymentService: async ({
    vendor_id,
    id_create,
    id_approve,
    nominal,
    payment_method,
    payment_date,
    receipt_number,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const amount = Number(nominal);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw {
          status_code: 400,
          message: "nominal deposit vendor harus lebih besar dari 0",
        };
      }

      const vendor = await MasterVendor.findByPk(vendor_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!vendor) {
        throw { status_code: 404, message: "data vendor tidak ditemukan" };
      }

      const depositNumber = await generateDepositVendorNumber(t);
      const deposit = await DepositVendorModel.create(
        {
          id_vendor: vendor_id,
          id_create,
          id_approve,
          no_deposit: depositNumber.nextNumber,
          cara_bayar: payment_method,
          tgl_faktur: payment_date,
          nominal: amount,
          note: `Sisa invoice ap payment ${receipt_number}`,
          status: "approved",
          status_proses: "done",
        },
        { transaction: t },
      );

      // jangan pakai increment: di SQL NULL + x = NULL, saldo vendor lama masih NULL
      await vendor.update(
        { saldo: Number(vendor.saldo || 0) + amount },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        data: {
          id: deposit.id,
          no_deposit: deposit.no_deposit,
          nominal: deposit.nominal,
          status: deposit.status,
        },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw {
        status_code: error.status_code || 500,
        success: false,
        message: error.message || "gagal membuat deposit vendor",
      };
    }
  },
};

async function findActiveDeposit(id, transaction) {
  const deposit = await DepositVendorModel.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!deposit || !deposit.is_active) {
    throwDepositError(404, "data deposit vendor tidak di temukan");
  }
  return deposit;
}

function parseNominal(nominal) {
  const amount = Number(nominal);
  if (!Number.isFinite(amount) || amount <= 0) {
    throwDepositError(400, "nominal deposit vendor harus lebih besar dari 0");
  }
  return amount;
}

function throwDepositError(statusCode, message) {
  throw { status_code: statusCode, message };
}

function toServiceError(error) {
  return {
    status_code: error.status_code || 500,
    success: false,
    message: error.message,
  };
}

// format VDP00001/10/26, nomor urut reset per tahun
async function generateDepositVendorNumber(transaction = null) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  const options = {
    attributes: ["no_deposit"],
    where: { createdAt: { [Op.between]: [startOfYear, endOfYear] } },
    order: [
      [
        literal(
          "CAST(SUBSTRING_INDEX(SUBSTRING(no_deposit, 4), '/', 1) AS UNSIGNED)",
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

  const lastDeposit = await DepositVendorModel.findOne(options);
  const lastNumber = lastDeposit?.no_deposit || null;
  const lastSequence = lastNumber
    ? parseInt(lastNumber.slice(3, lastNumber.indexOf("/")), 10) || 0
    : 0;
  const nextSequence = String(lastSequence + 1).padStart(5, "0");
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const shortYear = String(now.getFullYear()).slice(2);

  return {
    lastNumber,
    nextNumber: `VDP${nextSequence}/${currentMonth}/${shortYear}`,
  };
}

module.exports = DepositVendorService;
