const db = require("../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const GudangFinishGood = require("../../../../model/finishGood/gudangFinishGoodModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const JobOrderDone = require("../../../../model/produksi/produksiJoDoneModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterCustomer = require("../../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const MasterHargaPengiriman = require("../../../../model/masterData/marketing/masterHargaPengirimanModel");
const Users = require("../../../../model/userModel");
const DeliveryOrderService = require("../../../deliveryOrder/service/deliveryOrderService");
const MutasiBarangFinishGoodService = require("../../mutasiBarangFinishGood/service/mutasiBarangFinishGoodService");

const GudangFinishGoodService = {
  getGudangFinishGoodService: async ({
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
        const length = await GudangFinishGood.count({ where: obj });
        const data = await GudangFinishGood.findAll({
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
        const data = await GudangFinishGood.findByPk(id, {
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
        const data = await GudangFinishGood.findAll({
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

  getGudangFinishGoodGroupByIo: async ({
    page = "1",
    limit = "10",
    start_date,
    end_date,
    search,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereObj = {};

    if (search) {
      whereObj = {
        [Op.or]: [
          { no_io: { [Op.like]: `%${search}%` } },
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
      const totalGroups = await GudangFinishGood.count({
        where: whereObj,
        distinct: true,
        col: "id_io",
      });

      const groupedIds = await GudangFinishGood.findAll({
        attributes: [
          "id_io",
          "no_io",
          "id_customer",
          "customer",
          "id_produk",
          "produk",
          [Sequelize.fn("SUM", Sequelize.col("jumlah_qty")), "jumlah_qty"],
          [
            Sequelize.fn("SUM", Sequelize.col("jumlah_qty_keluar")),
            "jumlah_qty_keluar",
          ],
        ],
        where: whereObj,
        group: [
          "id_io",
          "no_io",
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

      const idIoList = groupedIds.map((item) => item.id_io);

      const detailData = await GudangFinishGood.findAll({
        where: {
          ...whereObj,
          id_io: { [Op.in]: idIoList },
        },
        order: [["createdAt", "DESC"]],
        raw: true,
      });

      const data = groupedIds.map((group) => {
        const jumlah_qty = parseFloat(group.jumlah_qty) || 0;
        const jumlah_qty_keluar = parseFloat(group.jumlah_qty_keluar) || 0;
        // jumlah_qty_sisa dihitung dari qty - qty_keluar
        const jumlah_qty_sisa = jumlah_qty - jumlah_qty_keluar;

        const details = detailData
          .filter((d) => d.id_io === group.id_io)
          .map((d) => ({
            ...d,
            // jumlah_qty_sisa per row juga dihitung ulang
            jumlah_qty_sisa:
              (parseFloat(d.jumlah_qty) || 0) -
              (parseFloat(d.jumlah_qty_keluar) || 0),
          }));

        return {
          id_io: group.id_io,
          no_io: group.no_io,
          id_customer: group.id_customer,
          customer: group.customer,
          id_produk: group.id_produk,
          produk: group.produk,
          jumlah_qty,
          jumlah_qty_keluar,
          jumlah_qty_sisa,
          data_barang: details,
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

  checkGudangFinishGoodByJo: async ({ id_jo }) => {
    try {
      const data = await GudangFinishGood.findOne({ where: { id_jo: id_jo } });
      return {
        status: 200,
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        status: 500,
        success: false,
        message: error.message,
      };
    }
  },

  creteGudangFinishGoodService: async ({
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    jumlah_qty,
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

      await GudangFinishGood.create(
        {
          id_jo: id_jo,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          no_jo: dataJo?.no_jo || null,
          no_io: dataIo?.no_io || null,
          no_so: dataSo?.no_so || null,
          no_po_customer: dataSo?.no_po_customer || null,
          customer: dataCustomer?.nama_customer || null,
          produk: dataProduk?.nama_produk || null,
          po_qty: dataSo?.po_qty || 0,
          jumlah_qty: jumlah_qty,
          toleransi_pengiriman: dataCustomer?.toleransi_pengiriman || null,
          note: dataSo?.note || null,
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

  updateQtyGudangFinishGood: async ({ id, jumlah_qty, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      //cek data gudang fg
      const dataGudangFg = await GudangFinishGood.findByPk(id);
      if (!dataGudangFg) {
        return {
          status_code: 404,
          success: false,
          message: "Data Gudang FG Tidak Ditemukan",
        };
      }
      await GudangFinishGood.update(
        {
          jumlah_qty: jumlah_qty,
        },
        { where: { id: id }, transaction: t },
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

  sendDoGudangFinishGoodSingle: async ({
    data_barang,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (data_barang.length == 0) {
        return {
          status_code: 404,
          success: false,
          message: "Data Barang tidak boleh kosong",
        };
      }

      for (let i = 0; i < data_barang.length; i++) {
        const e = data_barang[i];
        const getDatabarang = await GudangFinishGood.findByPk(e.id);
        const sendToDo = await DeliveryOrderService.creteDeliveryOrderService({
          id_customer: getDatabarang.id_customer,
          id_io: getDatabarang.id_io,
          id_jo: getDatabarang.id_jo,
          id_produk: getDatabarang.id_produk,
          id_so: getDatabarang.id_so,
          transaction: t,
        });

        if (sendToDo.success === false) {
          await t.rollback();

          throw {
            succes: false,
            status_code: 400,
            message: sendToDo.message,
          };
        }

        const createMutasiBarang =
          await MutasiBarangFinishGoodService.creteMutasiBarangFinishGoodService(
            {
              id_customer: getDatabarang.id_customer,
              id_io: getDatabarang.id_io,
              id_jo: getDatabarang.id_jo,
              id_produk: getDatabarang.id_produk,
              id_so: getDatabarang.id_so,
              id_user: id_user,
              jumlah_qty: e.jumlah_kirim,
              type_mutasi: "keluar",
              type_mutasi_keluar: "single",
              transaction: t,
            },
          );

        if (createMutasiBarang.success === false) {
          await t.rollback();

          throw {
            succes: false,
            status_code: 400,
            message: createMutasiBarang.message,
          };
        }

        await GudangFinishGood.update(
          {
            jumlah_qty_keluar: getDatabarang.jumlah_qty_keluar + e.jumlah_kirim,
          },
          { where: { id: e.id }, transaction: t },
        );
      }
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "send success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },

  sendDoGudangFinishGoodGroup: async ({
    data_barang,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (data_barang.length == 0) {
        return {
          status_code: 404,
          success: false,
          message: "Data Barang tidak boleh kosong",
        };
      }
      const mainJo = data_barang.find(
        (item) => item.is_main_jo == true || item.is_main_jo === "true",
      );

      const getDatabarangMain = await GudangFinishGood.findByPk(mainJo.id);
      const sendToDo = await DeliveryOrderService.creteDeliveryOrderService({
        id_customer: getDatabarangMain.id_customer,
        id_io: getDatabarangMain.id_io,
        id_jo: getDatabarangMain.id_jo,
        id_produk: getDatabarangMain.id_produk,
        id_so: getDatabarangMain.id_so,
        transaction: t,
      });

      if (sendToDo.success === false) {
        await t.rollback();

        throw {
          succes: false,
          status_code: 400,
          message: sendToDo.message,
        };
      }

      for (let i = 0; i < data_barang.length; i++) {
        const e = data_barang[i];
        const getDatabarang = await GudangFinishGood.findByPk(e.id);

        const createMutasiBarang =
          await MutasiBarangFinishGoodService.creteMutasiBarangFinishGoodService(
            {
              id_customer: getDatabarang.id_customer,
              id_io: getDatabarang.id_io,
              id_jo: getDatabarang.id_jo,
              id_produk: getDatabarang.id_produk,
              id_so: getDatabarang.id_so,
              id_user: id_user,
              jumlah_qty: e.jumlah_kirim,
              type_mutasi: "keluar",
              type_mutasi_keluar: "group",
              main_jo_mutasi_keluar: getDatabarangMain.no_jo,
              transaction: t,
            },
          );

        if (createMutasiBarang.success === false) {
          await t.rollback();

          throw {
            succes: false,
            status_code: 400,
            message: createMutasiBarang.message,
          };
        }

        await GudangFinishGood.update(
          {
            jumlah_qty_keluar: getDatabarang.jumlah_qty_keluar + e.jumlah_kirim,
          },
          { where: { id: e.id }, transaction: t },
        );
      }
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "send success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = GudangFinishGoodService;
