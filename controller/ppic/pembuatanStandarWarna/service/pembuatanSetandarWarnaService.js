const db = require("../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const PembuatanStandarWarna = require("../../../../model/ppic/standarWarna/pembuatanStandarWarnaModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterCustomer = require("../../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");

const PembuatanStandarWarnaService = {
  getPembuatanStandarWarnaService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    status,
    status_proses,
    search,
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
    if (status) obj.status = status;
    if (status_proses) obj.status_proses = status_proses;
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await PembuatanStandarWarna.count({ where: obj });
        const data = await PembuatanStandarWarna.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: SoModel,
              as: "so",
              attributes: ["po_qty"],
            },
          ],
        });
        return {
          status_code: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await PembuatanStandarWarna.findByPk(id);
        return {
          status_code: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await PembuatanStandarWarna.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        return {
          status_code: 200,
          success: true,
          data: data,
        };
      }
    } catch (error) {
      return {
        status_code: 500,
        success: false,
        message: error.message,
      };
    }
  },

  createPembuatanStandarWarnaService: async ({
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      //cek data jo
      const dataJo = await JobOrder.findByPk(id_jo);
      if (!dataJo) {
        return {
          status_code: 404,
          success: false,
          message: "Data JO Tidak Ditemukan",
        };
      }
      //cek data io
      const dataIo = await IoModel.findByPk(id_io);
      if (!dataIo) {
        return {
          status_code: 404,
          success: false,
          message: "Data IO Tidak Ditemukan",
        };
      }
      //cek data so
      const dataSo = await SoModel.findByPk(id_so);
      if (!dataSo) {
        return {
          status_code: 404,
          success: false,
          message: "Data SO Tidak Ditemukan",
        };
      }
      //cek data customer
      const dataCustomer = await MasterCustomer.findByPk(id_customer);
      //sementara dimatikan karena contoh data tidak ada
      //   if (!dataCustomer) {
      //     return {
      //       status_code: 404,
      //       success: false,
      //       message: "Data Customer Tidak Ditemukan",
      //     };
      //   }
      //cek data Produk
      const dataProduk = await MasterProduk.findByPk(id_produk);
      //sementara dimatikan karena contoh data tidak ada
      //   if (!dataProduk) {
      //     return {
      //       status_code: 404,
      //       success: false,
      //       message: "Data Produk Tidak Ditemukan",
      //     };
      //   }

      await PembuatanStandarWarna.create(
        {
          id_jo: id_jo,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          no_jo: dataJo?.no_jo || null,
          no_io: dataIo?.no_io || null,
          no_so: dataSo?.no_so || null,
          customer: dataCustomer?.nama_customer || null,
          produk: dataProduk?.nama_produk || null,
        },
        { transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },

  approvePembuatanStandarWarnaService: async ({
    id,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await PembuatanStandarWarna.findByPk(id);
      if (!checkData) {
        return {
          status_code: 404,
          success: false,
          message: "Data Pembuatan Standar Warna Tidak Ditemukan",
        };
      }
      await PembuatanStandarWarna.update(
        { status: "approved", status_proses: "done", id_user_approve: id_user },
        { where: { id: checkData.id }, transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "done success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },

  rejectPembuatanStandarWarnaService: async ({
    id,
    id_user,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await PembuatanStandarWarna.findByPk(id);
      if (!checkData) {
        return {
          status_code: 404,
          success: false,
          message: "Data Pembuatan Standar Warna Tidak Ditemukan",
        };
      }
      await PembuatanStandarWarna.update(
        {
          status: "rejected",
          status_proses: "done",
          id_user_reject: id_user,
          note: note,
        },
        { where: { id: checkData.id }, transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "reject success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },
};

module.exports = PembuatanStandarWarnaService;
