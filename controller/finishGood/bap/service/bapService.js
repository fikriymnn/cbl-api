const db = require("../../../../config/database");
const { Op } = require("sequelize");
const BAP = require("../../../../model/finishGood/bap/bapModel");
const BAPItem = require("../../../../model/finishGood/bap/bapItemModel");
const GudangFinishGood = require("../../../../model/finishGood/gudangFinishGoodModel");
const MutasiBarangFinishGoodService = require("../../mutasiBarangFinishGood/service/mutasiBarangFinishGoodService");
const Users = require("../../../../model/userModel");

const BapService = {
  getBapService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    status,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (search) {
      obj = {
        [Op.or]: [{ no_bap: { [Op.like]: `%${search}%` } }],
      };
    }
    if (status) obj.status = status;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_create = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (id) {
        const data = await BAP.findByPk(id, {
          include: [
            {
              model: BAPItem,
              as: "bap_item",
              include: [
                { model: Users, as: "user_create" },
                { model: Users, as: "user_approve" },
                { model: Users, as: "user_reject" },
              ],
            },
          ],
        });

        if (!data) {
          return {
            status: 404,
            success: false,
            message: "Data BAP Tidak Ditemukan",
          };
        }

        return { status: 200, success: true, data };
      } else if (page && limit) {
        const length = await BAP.count({ where: obj });
        const data = await BAP.findAll({
          order: [["tgl_create", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else {
        const data = await BAP.findAll({
          order: [["tgl_create", "DESC"]],
          where: obj,
        });
        return { status: 200, success: true, data };
      }
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  getBapItemService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_bap,
    status,
    id_gudang_finish_good,
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (search) {
      obj = {
        [Op.or]: [
          { no_jo: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (id_bap) obj.id_bap = id_bap;
    if (status) obj.status = status;
    if (id_gudang_finish_good)
      obj.id_gudang_finish_good = id_gudang_finish_good;
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_create = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (id) {
        const data = await BAPItem.findByPk(id, {
          include: [{ model: GudangFinishGood, as: "gudang_finish_good" }],
        });

        if (!data) {
          return {
            status: 404,
            success: false,
            message: "Data BAP Item Tidak Ditemukan",
          };
        }

        return { status: 200, success: true, data };
      } else if (page && limit) {
        const length = await BAPItem.count({ where: obj });
        const data = await BAPItem.findAll({
          order: [["tgl_create", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else {
        const data = await BAPItem.findAll({
          order: [["tgl_create", "DESC"]],
          where: obj,
        });
        return { status: 200, success: true, data };
      }
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  // id_gudang_finish_good: array of id
  createBapService: async ({ no_bap, id_gudang_finish_good, id_user }) => {
    const t = await db.transaction();

    try {
      if (
        !Array.isArray(id_gudang_finish_good) ||
        id_gudang_finish_good.length === 0
      ) {
        await t.rollback();
        return {
          status_code: 400,
          success: false,
          message:
            "id_gudang_finish_good harus berupa array dan tidak boleh kosong",
        };
      }

      const dataBap = await BAP.create(
        {
          id_user,
          no_bap,
          tgl_create: new Date(),
          status: "incoming",
        },
        { transaction: t }
      );

      for (const idGudang of id_gudang_finish_good) {
        const dataGudangFg = await GudangFinishGood.findByPk(idGudang, {
          transaction: t,
        });

        if (!dataGudangFg) {
          await t.rollback();
          return {
            status_code: 404,
            success: false,
            message: `Data Gudang FG dengan id ${idGudang} Tidak Ditemukan`,
          };
        }

        await BAPItem.create(
          {
            id_bap: dataBap.id,
            id_gudang_finish_good: dataGudangFg.id,
            id_jo: dataGudangFg.id_jo,
            id_io: dataGudangFg.id_io,
            id_so: dataGudangFg.id_so,
            id_customer: dataGudangFg.id_customer,
            id_produk: dataGudangFg.id_produk,
            id_user_create: id_user,
            no_jo: dataGudangFg.no_jo,
            no_io: dataGudangFg.no_io,
            no_so: dataGudangFg.no_so,
            no_po_customer: dataGudangFg.no_po_customer,
            customer: dataGudangFg.customer,
            produk: dataGudangFg.produk,
            po_qty: dataGudangFg.po_qty,
            jumlah_qty: dataGudangFg.jumlah_qty,
            tgl_masuk: dataGudangFg.tgl_masuk,
            tgl_create: new Date(),
            status: "incoming",
          },
          { transaction: t }
        );

        await GudangFinishGood.update(
          { status: "bap" },
          { where: { id: dataGudangFg.id }, transaction: t }
        );
      }

      await t.commit();
      return { status_code: 200, success: true, message: "create success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  doneBapService: async ({ id }) => {
    const t = await db.transaction();

    try {
      const dataBap = await BAP.findByPk(id, { transaction: t });
      if (!dataBap) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data BAP Tidak Ditemukan",
        };
      }

      await BAP.update(
        { status: "history" },
        { where: { id }, transaction: t }
      );

      await t.commit();
      return { status_code: 200, success: true, message: "bap done success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  approveBapItemService: async ({ id, note, id_user }) => {
    const t = await db.transaction();

    try {
      const dataBapItem = await BAPItem.findByPk(id, { transaction: t });
      if (!dataBapItem) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data BAP Item Tidak Ditemukan",
        };
      }

      await BAPItem.update(
        {
          status: "approve",
          note: note || null,
          tgl_respon: new Date(),
          id_user_approve: id_user,
        },
        { where: { id }, transaction: t }
      );

      await GudangFinishGood.update(
        { is_active: false },
        {
          where: { id: dataBapItem.id_gudang_finish_good },
          transaction: t,
        }
      );

      const createMutasiBarang =
        await MutasiBarangFinishGoodService.creteMutasiBarangFinishGoodService({
          id_customer: dataBapItem.id_customer,
          id_io: dataBapItem.id_io,
          id_jo: dataBapItem.id_jo,
          id_produk: dataBapItem.id_produk,
          id_so: dataBapItem.id_so,
          id_user,
          jumlah_qty: dataBapItem.jumlah_qty,
          type_mutasi: "keluar",
          sumber_mutasi: "bap",
          note: note || null,
          transaction: t,
        });

      if (createMutasiBarang.success === false) {
        await t.rollback();
        throw {
          success: false,
          status_code: 400,
          message: createMutasiBarang.message,
        };
      }

      await t.commit();
      return { status_code: 200, success: true, message: "approve success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  rejectBapItemService: async ({ id, note, id_user }) => {
    const t = await db.transaction();

    try {
      const dataBapItem = await BAPItem.findByPk(id, { transaction: t });
      if (!dataBapItem) {
        await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data BAP Item Tidak Ditemukan",
        };
      }

      await BAPItem.update(
        {
          status: "reject",
          note: note || null,
          tgl_respon: new Date(),
          id_user_reject: id_user,
        },
        { where: { id }, transaction: t }
      );

      await GudangFinishGood.update(
        { status: "keep" },
        {
          where: { id: dataBapItem.id_gudang_finish_good },
          transaction: t,
        }
      );

      await t.commit();
      return { status_code: 200, success: true, message: "reject success" };
    } catch (error) {
      await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = BapService;
