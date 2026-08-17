const db = require("../../../config/database");
const { Op, Sequelize } = require("sequelize");
const EstimasiKurangQty = require("../../../model/produksi/estimasiKurangQtyModel");
const ProduksiLkhTahapan = require("../../../model/produksi/produksiLkhTahapanModel");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const User = require("../../../model/userModel");
const EstimasiKurangQtyPpicService = require("../../ppic/estimasiKurangQty/service/estimasiKurangQtyService");

const EstimasiKurangQtyService = {
  getEstimasiKurangQtyService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    status,
    search,
    id_jo,
    id_io,
    id_so,
    id_customer,
    id_produk,
    id_tahapan,
    tahapan_bawahan,
    is_active,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    // default: hanya tampilkan data yang is_active = true,
    // kecuali caller secara eksplisit mengirim is_active
    if (typeof is_active !== "undefined") {
      obj.is_active =
        is_active === "false" || is_active === false ? false : true;
    } else {
      obj.is_active = true;
    }

    if (search) {
      obj[Op.or] = [
        { no_jo: { [Op.like]: `%${search}%` } },
        { no_io: { [Op.like]: `%${search}%` } },
        { no_so: { [Op.like]: `%${search}%` } },
        { customer: { [Op.like]: `%${search}%` } },
        { produk: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) obj.status = status;
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;
    if (id_tahapan) obj.id_tahapan = id_tahapan;
    if (tahapan_bawahan) {
      let arrTahapanBawahan;

      if (Array.isArray(tahapan_bawahan)) {
        // sudah array asli (misal dari body JSON, atau ?tahapan_bawahan[]=1&tahapan_bawahan[]=2)
        arrTahapanBawahan = tahapan_bawahan;
      } else {
        try {
          // handle string "[1,2,3]"
          arrTahapanBawahan = JSON.parse(tahapan_bawahan);
        } catch (e) {
          // fallback handle string "1,2,3"
          arrTahapanBawahan = String(tahapan_bawahan).split(",");
        }
      }

      obj.id_tahapan = { [Op.in]: arrTahapanBawahan.map((v) => parseInt(v)) };
    }

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    try {
      if (page && limit) {
        const length = await EstimasiKurangQty.count({ where: obj });
        const data = await EstimasiKurangQty.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [{ model: MasterTahapan, as: "tahapan" }],
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else if (id) {
        const data = await EstimasiKurangQty.findByPk(id, {
          include: [
            { model: MasterTahapan, as: "tahapan" },
            { model: User, as: "user_request" },
            { model: User, as: "user_approve" },
          ],
        });
        if (!data) {
          return {
            status: 404,
            success: false,
            message: "Data Estimasi Kurang Qty Tidak Ditemukan",
          };
        }
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else {
        const data = await EstimasiKurangQty.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [{ model: MasterTahapan, as: "tahapan" }],
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

  createEstimasiKurangQtyService: async ({
    id_produksi_lkh_tahapan,
    qty_kurang_qty,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      // cek data produksi lkh tahapan, sumber data untuk kolom2 lainnya
      const dataLkhTahapan = await ProduksiLkhTahapan.findByPk(
        id_produksi_lkh_tahapan,
      );
      if (!dataLkhTahapan) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Produksi LKH Tahapan Tidak Ditemukan",
        };
      }

      await EstimasiKurangQty.create(
        {
          id_produksi_lkh_tahapan: dataLkhTahapan.id,
          id_jo: dataLkhTahapan.id_jo,
          id_io: dataLkhTahapan.id_io,
          id_so: dataLkhTahapan.id_so,
          id_customer: dataLkhTahapan.id_customer,
          id_produk: dataLkhTahapan.id_produk,
          id_tahapan: dataLkhTahapan.id_tahapan,
          id_request: id_user,
          no_jo: dataLkhTahapan.no_jo || null,
          no_io: dataLkhTahapan.no_io || null,
          no_so: dataLkhTahapan.no_so || null,
          customer: dataLkhTahapan.customer || null,
          produk: dataLkhTahapan.produk || null,
          qty_jo: dataLkhTahapan.qty_jo || null,
          qty_kurang_qty: qty_kurang_qty,
          spesifikasi: dataLkhTahapan.spesifikasi || null,
          tgl_request: new Date(),
          status: "requested",
          is_active: true,
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

  updateEstimasiKurangQtyService: async ({
    id,
    qty_kurang_qty,
    spesifikasi,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await EstimasiKurangQty.findByPk(id);
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Estimasi Kurang Qty Tidak Ditemukan",
        };
      }

      const dataUpdate = {};
      if (typeof qty_kurang_qty !== "undefined")
        dataUpdate.qty_kurang_qty = qty_kurang_qty;
      if (typeof spesifikasi !== "undefined")
        dataUpdate.spesifikasi = spesifikasi;

      await EstimasiKurangQty.update(dataUpdate, {
        where: { id: checkData.id },
        transaction: t,
      });

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "update success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },

  deleteEstimasiKurangQtyService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await EstimasiKurangQty.findByPk(id);
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Estimasi Kurang Qty Tidak Ditemukan",
        };
      }

      await EstimasiKurangQty.update(
        { is_active: false },
        { where: { id: checkData.id }, transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "delete success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },

  approveEstimasiKurangQtyService: async ({
    id,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const checkData = await EstimasiKurangQty.findByPk(id);
      if (!checkData) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Estimasi Kurang Qty Tidak Ditemukan",
        };
      }

      await EstimasiKurangQty.update(
        {
          status: "approved",
          id_approve: id_user,
          tgl_approve: new Date(),
        },
        { where: { id: checkData.id }, transaction: t },
      );

      const createTiketPpic =
        await EstimasiKurangQtyPpicService.createEstimasiKurangQtyService({
          id_produksi_lkh_tahapan: checkData.id_produksi_lkh_tahapan,
          qty_kurang_qty: checkData.qty_kurang_qty,
          id_user: id_user,
          transaction: t,
        });

      if (createTiketPpic.success === false) {
        await t.rollback();

        throw {
          succes: false,
          status_code: 400,
          message: createTiketPpic.message,
        };
      }

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "approve success",
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { status_code: 500, success: false, message: error.message };
    }
  },
};

module.exports = EstimasiKurangQtyService;
