const db = require("../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const ProduksiJoDone = require("../../../model/produksi/produksiJoDoneModel");
const IoModel = require("../../../model/marketing/io/ioModel");
const SoModel = require("../../../model/marketing/so/soModel");
const JobOrder = require("../../../model/ppic/jobOrder/jobOrderModel");
const MasterCustomer = require("../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../model/masterData/marketing/masterProdukModel");
const InspeksiFinalService = require("../../../controller/qc/inspeksi/final/service/inspeksiFinalService");
const FormatTanggalFunction = require("../../../helper/tanggalFormatFunction");

const ProduksiJoDoneService = {
  getProduksiJoDoneService: async ({
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
        const length = await ProduksiJoDone.count({ where: obj });
        const data = await ProduksiJoDone.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await ProduksiJoDone.findByPk(id);
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await ProduksiJoDone.findAll({
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

  creteProduksiJoDoneService: async ({
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    id_user,
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

      await ProduksiJoDone.create(
        {
          id_jo: id_jo,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          id_user: id_user,
          no_jo: dataJo?.no_jo || null,
          no_io: dataIo?.no_io || null,
          no_so: dataSo?.no_so || null,
          customer: dataCustomer?.nama_customer || null,
          produk: dataProduk?.nama_produk || null,
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
  kirimProduksiJoDoneService: async ({
    id,
    qty_kirim,
    is_jo_done,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await ProduksiJoDone.findByPk(id);
      if (!checkData) {
        return {
          status_code: 404,
          success: false,
          message: "Data List JO Done Tidak Ditemukan",
        };
      }
      //cek data jo
      const dataJo = await JobOrder.findByPk(checkData.id_jo);
      if (!dataJo) {
        return {
          status_code: 404,
          success: false,
          message: "Data JO Tidak Ditemukan",
        };
      }

      await ProduksiJoDone.update(
        {
          is_jo_done: is_jo_done,
          id_user: id_user,
          status: "progress",
          status_proses: "check qc",
          qty_kirim: checkData.qty_kirim + qty_kirim,
        },
        { where: { id: checkData.id }, transaction: t }
      );

      const formatTanggalNow = FormatTanggalFunction.formatTanggal(new Date());

      const createInspeksiFinal =
        await InspeksiFinalService.creteInspeksiFinalService({
          tanggal: formatTanggalNow.tanggal,
          id_jo: checkData.id_jo,
          no_jo: checkData.no_jo,
          no_io: checkData.no_io,
          quantity: qty_kirim,
          jam: formatTanggalNow.jam,
          nama_produk: checkData.produk,
          customer: checkData.customer,
          status_jo: dataJo.status_jo,
          transaction: t,
        });

      if (createInspeksiFinal.success === false) {
        if (!transaction) await t.rollback();

        return res.status(400).json(createInspeksiFinal);
      }
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "Kirim success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },

  doneProduksiJoDoneService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await ProduksiJoDone.findByPk(id);
      if (!checkData) {
        return {
          status_code: 404,
          success: false,
          message: "Data List JO Done Tidak Ditemukan",
        };
      }
      await ProduksiJoDone.update(
        { status: "done", status_proses: "done" },
        { where: { id: checkData.id }, transaction: t }
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

  rejectQcProduksiJoDoneService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await ProduksiJoDone.findByPk(id);
      if (!checkData) {
        return {
          status_code: 404,
          success: false,
          message: "Data List JO Done Tidak Ditemukan",
        };
      }
      await ProduksiJoDone.update(
        { status: "reject", status_proses: "reject qc" },
        { where: { id: checkData.id }, transaction: t }
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

module.exports = ProduksiJoDoneService;
