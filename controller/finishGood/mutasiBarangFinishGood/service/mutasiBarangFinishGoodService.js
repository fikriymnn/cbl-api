const db = require("../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const MutasiBarangFinishGood = require("../../../../model/finishGood/mutasiBarangFinishGoodModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const JobOrderDone = require("../../../../model/produksi/produksiJoDoneModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterCustomer = require("../../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const MasterHargaPengiriman = require("../../../../model/masterData/marketing/masterHargaPengirimanModel");
const Users = require("../../../../model/userModel");

const MutasiBarangFinishGoodService = {
  getMutasiBarangFinishGoodService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
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
        const length = await MutasiBarangFinishGood.count({ where: obj });
        const data = await MutasiBarangFinishGood.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: MasterCustomer,
              as: "detail_customer",
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
        const data = await MutasiBarangFinishGood.findByPk(id, {
          include: [
            {
              model: MasterCustomer,
              as: "detail_customer",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await MutasiBarangFinishGood.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: MasterCustomer,
              as: "detail_customer",
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

  getMutasiBarangFinishGoodByJo: async ({
    page = "1",
    limit = "2",
    start_date,
    end_date,
    search,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereObj = {};

    if (search) {
      whereObj = {
        [Op.or]: [
          { no_jo: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      whereObj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    try {
      // Hitung total distinct id_jo untuk pagination
      const totalGroups = await MutasiBarangFinishGood.count({
        where: whereObj,
        distinct: true,
        col: "id_jo",
      });

      // Ambil grouped data per id_jo dengan pagination
      const groupedData = await MutasiBarangFinishGood.findAll({
        attributes: [
          "id_io",
          "no_io",
          "id_jo",
          "no_jo",
          "id_so",
          "no_so",
          "id_customer",
          "customer",
          "id_produk",
          "produk",
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal(
                `CASE WHEN type_mutasi = 'masuk' THEN jumlah_qty ELSE 0 END`,
              ),
            ),
            "jumlah_qty_masuk",
          ],
          [
            Sequelize.fn(
              "SUM",
              Sequelize.literal(
                `CASE WHEN type_mutasi = 'keluar' THEN jumlah_qty ELSE 0 END`,
              ),
            ),
            "jumlah_qty_keluar",
          ],
        ],
        where: whereObj,
        group: [
          "id_io",
          "no_io",
          "id_jo",
          "no_jo",
          "id_so",
          "no_so",
          "id_customer",
          "customer",
          "id_produk",
          "produk",
        ],
        order: [[Sequelize.fn("MAX", Sequelize.col("createdAt")), "DESC"]],
        limit: parseInt(limit),
        offset,
        raw: true,
      });

      // Ambil detail mutasi berdasarkan id_jo yang ada di halaman ini
      const idJoList = groupedData.map((item) => item.id_jo);

      const detailData = await MutasiBarangFinishGood.findAll({
        where: {
          ...whereObj,
          id_jo: { [Op.in]: idJoList },
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      // Gabungkan grouped data dengan detail mutasi
      const data = groupedData.map((group) => {
        const data_mutasi = detailData.filter((d) => d.id_jo === group.id_jo);

        return {
          id_io: group.id_io,
          no_io: group.no_io,
          id_jo: group.id_jo,
          no_jo: group.no_jo,
          id_so: group.id_so,
          no_so: group.no_so,
          id_customer: group.id_customer,
          customer: group.customer,
          id_produk: group.id_produk,
          produk: group.produk,
          jumlah_qty_masuk: parseFloat(group.jumlah_qty_masuk) || 0,
          jumlah_qty_keluar: parseFloat(group.jumlah_qty_keluar) || 0,
          data_mutasi,
        };
      });

      return {
        status: 200,
        success: true,
        data,
        total_page: Math.ceil(totalGroups / parseInt(limit)),
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteMutasiBarangFinishGoodService: async ({
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    id_user,
    jumlah_qty,
    type_mutasi,
    type_mutasi_keluar = null,
    main_jo_mutasi_keluar = null,
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

      await MutasiBarangFinishGood.create(
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
          no_po_customer: dataSo?.no_po_customer || null,
          customer: dataCustomer?.nama_customer || null,
          produk: dataProduk?.nama_produk || null,
          jumlah_qty: jumlah_qty,
          type_mutasi: type_mutasi,
          type_mutasi_keluar: type_mutasi_keluar,
          main_jo_mutasi_keluar: main_jo_mutasi_keluar,
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
      throw { success: false, message: error.message };
    }
  },
};

module.exports = MutasiBarangFinishGoodService;
