const db = require("../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const RequestPurchaseModel = require("../../../../model/purchasing/requestPurchase/requestPurchaseModel");
const IoModel = require("../../../../model/marketing/io/ioModel");
const SoModel = require("../../../../model/marketing/so/soModel");
const JobOrderDone = require("../../../../model/produksi/produksiJoDoneModel");
const JobOrder = require("../../../../model/ppic/jobOrder/jobOrderModel");
const MasterCustomer = require("../../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../../model/masterData/marketing/masterProdukModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const MasterHargaPengiriman = require("../../../../model/masterData/marketing/masterHargaPengirimanModel");
const Users = require("../../../../model/userModel");
const JobOrderMounting = require("../../../../model/ppic/jobOrder/joMountingModel");
const BomPpicModel = require("../../../../model/ppic/bomPpic/bomPpicModel");
const BomPpicKertasModel = require("../../../../model/ppic/bomPpic/bomPpicKertasModel");
const BomPpicTintaModel = require("../../../../model/ppic/bomPpic/bomPpicTintaModel");
const BomPpicTintaDetailModel = require("../../../../model/ppic/bomPpic/bomPpicTintaDetailModel");
const BomPpicCorrugatedModel = require("../../../../model/ppic/bomPpic/bomPpicCorrugatedModel");
const BomPpicPolibanModel = require("../../../../model/ppic/bomPpic/bomPpicPolibanModel");
const BomPpicCoatingModel = require("../../../../model/ppic/bomPpic/bomPpicCoatingModel");
const BomPpicLemModel = require("../../../../model/ppic/bomPpic/bomPpicLemModel");
const BomPpicUserAction = require("../../../../model/ppic/bomPpic/bomPpicUserActionModel");
const BomPpicLainLain = require("../../../../model/ppic/bomPpic/bomPpicLainLainModel");

/**
 * Helper: mapping data BomPpic (plain object) -> array data siap insert RequestPurchase.
 * Hanya item dengan qty_beli > 0 yang dimasukkan.
 */
const buildRequestPurchasePayload = (bomPpic, id_user_request) => {
  const results = [];

  const base = {
    id_jo: bomPpic.id_jo,
    id_io: bomPpic.id_io,
    id_so: bomPpic.id_so,
    id_bom_ppic: bomPpic.id,
    id_request: id_user_request || null,
    no_bom_ppic: bomPpic.no_bom_ppic,
    no_io: bomPpic.no_io,
    no_so: bomPpic.no_so,
    no_jo: bomPpic.no_jo,
    customer: bomPpic.customer,
    produk: bomPpic.produk,
    tgl_kirim: bomPpic?.so?.tgl_pengiriman || null,
    tgl_request: new Date(),
    status: "incoming",
    is_active: true,
  };

  const pushItem = ({ id_item, nama_item, qty, tipe_barang, satuan }) => {
    if (!qty || qty <= 0) return;
    results.push({
      ...base,
      id_item: id_item ?? null,
      nama_item: nama_item ?? null,
      qty,
      tipe_barang,
      satuan: satuan ?? null,
    });
  };

  // KERTAS
  (bomPpic.bom_ppic_kertas || []).forEach((item) => {
    pushItem({
      id_item: item.id_kertas,
      nama_item: item.nama_kertas,
      qty: item.qty_beli,
      tipe_barang: "kertas",
      satuan: "lp",
    });
  });

  // TINTA (nested tinta_detail)
  (bomPpic.bom_ppic_tinta || []).forEach((tinta) => {
    (tinta.tinta_detail || []).forEach((detail) => {
      pushItem({
        id_item: detail.id_item_tinta,
        nama_item: detail.nama_item_tinta,
        qty: detail.qty_beli,
        tipe_barang: "tinta",
        satuan: "kg",
      });
    });
  });

  // CORRUGATED
  (bomPpic.bom_ppic_corrugated || []).forEach((item) => {
    pushItem({
      id_item: item.id_corrugated,
      nama_item: item.nama_corrugated,
      qty: item.qty_beli,
      tipe_barang: "corrugated",
      satuan: "pcs",
    });
  });

  // POLIBAN
  (bomPpic.bom_ppic_poliban || []).forEach((item) => {
    pushItem({
      id_item: null,
      nama_item: item.item_poliban,
      qty: item.qty_beli,
      tipe_barang: "poliban",
      //satuan: "ikat",
    });
  });

  // COATING (depan & belakang)
  (bomPpic.bom_ppic_coating || []).forEach((item) => {
    pushItem({
      id_item: item.id_coating,
      nama_item: item.nama_coating,
      qty: item.qty_beli,
      tipe_barang: "coating",
      satuan: "kg",
    });
  });

  // LEM
  (bomPpic.bom_ppic_lem || []).forEach((item) => {
    pushItem({
      id_item: item.id_lem,
      nama_item: item.nama_lem,
      qty: item.qty_beli,
      tipe_barang: "lem",
      satuan: "kg",
    });
  });

  return results;
};

const RequestPurchaseService = {
  getRequestPurchaseService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    start_date_kirim,
    end_date_kirim,
    start_date_cetak,
    end_date_cetak,
    search,
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    status,
    tipe_barang,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { no_bom_ppic: { [Op.like]: `%${search}%` } },
          { no_io: { [Op.like]: `%${search}%` } },
          { no_so: { [Op.like]: `%${search}%` } },
          { customer: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
          { no_jo: { [Op.like]: `%${search}%` } },
          { nama_item: { [Op.like]: `%${search}%` } },
          { tipe_barang: { [Op.like]: `%${search}%` } },
          { produk: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;
    if (status) obj.status = status;
    if (tipe_barang) obj.tipe_barang = tipe_barang;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    if (start_date_kirim && end_date_kirim) {
      const startDateKirim = new Date(start_date_kirim).setHours(0, 0, 0, 0);
      const endDateKirim = new Date(end_date_kirim).setHours(23, 59, 59, 999);
      obj.tgl_kirim = { [Op.between]: [startDateKirim, endDateKirim] };
    }
    if (start_date_cetak && end_date_cetak) {
      const startDateCetak = new Date(start_date_cetak).setHours(0, 0, 0, 0);
      const endDateCetak = new Date(end_date_cetak).setHours(23, 59, 59, 999);
      obj.rencana_cetak = { [Op.between]: [startDateCetak, endDateCetak] };
    }

    obj.is_active = true;
    try {
      if (page && limit) {
        const length = await RequestPurchaseModel.count({ where: obj });
        const data = await RequestPurchaseModel.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: MasterBarang,
              as: "detail_item",
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
        const data = await RequestPurchaseModel.findByPk(id, {
          include: [
            {
              model: MasterBarang,
              as: "detail_item",
            },
            {
              model: Users,
              as: "user_request",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await RequestPurchaseModel.findAll({
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

  getRekapTipeBarangService: async () => {
    try {
      const data = await RequestPurchaseModel.findAll({
        attributes: [
          "tipe_barang",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "total_data"],
          // kalau ada kolom qty yang mau ditotal juga, tinggal tambahkan:
          // [sequelize.fn("SUM", sequelize.col("qty")), "total_qty"],
        ],
        where: { is_active: true, status: "incoming" },
        group: ["tipe_barang"],
        order: [["tipe_barang", "ASC"]],
        raw: true,
      });

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

  creteRequestPurchaseService: async ({
    id_user_request,
    id_bom_ppic,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek bom ppic
      const dataBomPpic = await BomPpicModel.findByPk(id_bom_ppic, {
        include: [
          {
            model: SoModel,
            as: "so",
          },
          {
            model: BomPpicKertasModel,
            as: "bom_ppic_kertas",
          },
          {
            model: BomPpicTintaModel,
            as: "bom_ppic_tinta",
            include: [
              {
                model: BomPpicTintaDetailModel,
                as: "tinta_detail",
              },
            ],
          },
          {
            model: BomPpicCorrugatedModel,
            as: "bom_ppic_corrugated",
          },
          {
            model: BomPpicPolibanModel,
            as: "bom_ppic_poliban",
          },
          {
            model: BomPpicCoatingModel,
            as: "bom_ppic_coating",
          },
          {
            model: BomPpicLemModel,
            as: "bom_ppic_lem",
          },
          {
            model: BomPpicLainLain,
            as: "lain_lain",
          },
          {
            model: Users,
            as: "user_create",
          },
          {
            model: Users,
            as: "user_approve",
          },
        ],
      });

      if (!dataBomPpic) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data BOM PPIC Tidak Ditemukan",
        };
      }

      // convert ke plain object supaya gampang diolah
      const plainBomPpic = dataBomPpic.toJSON();

      // 🔧 generate payload request purchase (filter qty_beli > 0)
      const payloadRequestPurchase = buildRequestPurchasePayload(
        plainBomPpic,
        id_user_request
      );

      if (payloadRequestPurchase.length === 0) {
        return {
          status_code: 400,
          success: false,
          message:
            "Tidak ada item dengan qty_beli > 0 untuk dibuatkan request purchase",
        };
      }

      //📝 insert semua item request purchase
      const createdRequestPurchase = await RequestPurchaseModel.bulkCreate(
        payloadRequestPurchase,
        { transaction: t }
      );

      await BomPpicModel.update(
        { is_request_purchase: true },
        { where: { id: id_bom_ppic }, transaction: t }
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: payloadRequestPurchase,
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = RequestPurchaseService;
