const db = require("../../../../config/database");
const { Op, fn, col, literal } = require("sequelize");
const DepositModel = require("../../../../model/akunting/deposit/depositModel");
const MasterCustomer = require("../../../../model/masterData/marketing/masterCustomerModel");
const Users = require("../../../../model/userModel");

const DepositService = {
  getDepositService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_customer,
    status,
    status_proses,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { no_deposit: { [Op.like]: `%${search}%` } },
          { cara_bayar: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (id_customer) obj.id_customer = id_customer;
    if (status) obj.status = status;
    if (status_proses) obj.status_proses = status_proses;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await DepositModel.count({ where: obj });
        const data = await DepositModel.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: MasterCustomer,
              as: "customer",
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
        const data = await DepositModel.findByPk(id, {
          include: [
            {
              model: MasterCustomer,
              as: "customer",
            },
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
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await DepositModel.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: MasterCustomer,
              as: "customer",
            },
          ],
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

  getNoDepositService: async () => {
    try {
      //get data terakhir
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1); // 1 Jan tahun ini
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59); // 31 Des tahun ini

      const lastDeposit = await DepositModel.findOne({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear],
          },
        },
        order: [
          // extract nomor urut pada format SDP00001/12/25
          [
            literal(
              `CAST(SUBSTRING_INDEX(SUBSTRING(no_deposit, 4), '/', 1) AS UNSIGNED)`
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

      if (lastDeposit) {
        const lastNo = lastDeposit.no_deposit; // contoh: SDP00005/12/25

        // Ambil "00005" → ubah ke integer
        const lastSeq = parseInt(lastNo.substring(3, lastNo.indexOf("/")), 10);

        nextNumber = lastSeq + 1;
      }

      // 3. Buat nomor urut padded 5 digit
      const paddedNumber = String(nextNumber).padStart(5, "0");

      // 4. Susun format akhir
      const newDepositNumber = `SDP${paddedNumber}/${currentMonth}/${shortYear}`;
      return {
        status: 200,
        success: true,
        no_deposit: lastDeposit.no_deposit,
        new_no_deposit: newDepositNumber,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteDepositService: async ({
    id_customer,
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
      await DepositModel.create(
        {
          id_customer: id_customer,
          id_create: id_create,
          no_deposit: no_deposit,
          cara_bayar: cara_bayar,
          billing_address: billing_address,
          tgl_faktur: tgl_faktur,
          nominal: nominal,
          note: note,
        },
        { transaction: t }
      );
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

  updateDepositService: async ({
    id,
    id_customer,
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
      await DepositModel.update(
        {
          id_customer: id_customer,
          no_deposit: no_deposit,
          cara_bayar: cara_bayar,

          billing_address: billing_address,
          tgl_faktur: tgl_faktur,
          nominal: nominal,
          note: note,
        },
        { where: { id: id }, transaction: t }
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

  requestDepositService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      await DepositModel.update(
        {
          status: "requested",
          status_proses: "requested",
        },
        { where: { id: id }, transaction: t }
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

  approveDepositService: async ({ id, id_approve, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const getDataDeposit = await DepositModel.findByPk(id);
      if (!getDataDeposit)
        throw {
          success: false,
          status_code: 404,
          message: "data deposit tidak di temukan",
        };

      const getDataCustomer = await MasterCustomer.findByPk(
        getDataDeposit.id_customer
      );
      if (!getDataCustomer)
        throw {
          success: false,
          status_code: 404,
          message: "data customer tidak di temukan",
        };
      await DepositModel.update(
        {
          status: "approved",
          status_proses: "done",
          id_approve: id_approve,
        },
        { where: { id: id }, transaction: t }
      );

      await MasterCustomer.update(
        { saldo: getDataCustomer.saldo || 0 + getDataDeposit.nominal },
        { where: { id: getDataCustomer.id }, transaction: t }
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

  rejectDepositService: async ({ id, id_reject, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      await DepositModel.update(
        {
          status: "draft",
          status_proses: "requested",
          id_reject: id_reject,
        },
        { where: { id: id }, transaction: t }
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

  deleteDepositService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      await DepositModel.update(
        {
          is_active: false,
        },
        { where: { id: id }, transaction: t }
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

module.exports = DepositService;
