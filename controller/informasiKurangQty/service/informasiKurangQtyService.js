const db = require("../../../config/database");
const { Op } = require("sequelize");
const InformasiKurangQty = require("../../../model/informasiKurangQty/informasiKurangQtyModel");
const JoModel = require("../../../model/ppic/jobOrder/jobOrderModel");
const MasterProduk = require("../../../model/masterData/marketing/masterProdukModel");
const MasterMesinTahapan = require("../../../model/masterData/tahapan/masterMesinTahapanModel");
const Users = require("../../../model/userModel");

const InformasiKurangQtyService = {
  getInformasiKurangQtyService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_jo,
    id_produk,
    id_mesin_cetak,
  }) => {
    const where = { is_active: true };
    if (search) {
      where[Op.or] = [
        { no_jo: { [Op.like]: `%${search}%` } },
        { nama_produk: { [Op.like]: `%${search}%` } },
        { nama_mesin_cetak: { [Op.like]: `%${search}%` } },
        { jenis_kerusakan: { [Op.like]: `%${search}%` } },
      ];
    }
    if (id_jo) where.id_jo = id_jo;
    if (id_produk) where.id_produk = id_produk;
    if (id_mesin_cetak) where.id_mesin_cetak = id_mesin_cetak;
    // filter berdasarkan tgl_cetak
    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      where.tgl_cetak = { [Op.between]: [startDate, endDate] };
    }

    const include = [
      { model: JoModel, as: "jo", attributes: ["id", "no_jo"] },
      {
        model: MasterProduk,
        as: "detail_produk",
        attributes: ["id", "nama_produk"],
      },
      {
        model: MasterMesinTahapan,
        as: "mesin_cetak",
        attributes: ["id", "kode_mesin", "nama_mesin"],
      },
      { model: Users, as: "user_create", attributes: ["id", "nama"] },
    ];

    try {
      if (id) {
        const data = await InformasiKurangQty.findOne({
          where: { ...where, id },
          include,
        });
        if (!data) {
          return {
            status: 404,
            success: false,
            message: "data informasi kurang qty tidak ditemukan",
          };
        }
        return { status: 200, success: true, data };
      }

      if (page && limit) {
        const parsedLimit = parseInt(limit);
        const length = await InformasiKurangQty.count({ where });
        const data = await InformasiKurangQty.findAll({
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

      const data = await InformasiKurangQty.findAll({
        order: [["createdAt", "DESC"]],
        where,
        include,
      });
      return { status: 200, success: true, data };
    } catch (error) {
      return { status: 500, success: false, message: error.message };
    }
  },

  createInformasiKurangQtyService: async ({
    id_jo,
    no_jo,
    id_produk,
    nama_produk,
    qty_po,
    qty_kurang,
    id_mesin_cetak,
    nama_mesin_cetak,
    tgl_cetak,
    jenis_kerusakan,
    note,
    id_create,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const data = await InformasiKurangQty.create(
        {
          id_jo,
          no_jo,
          id_produk,
          nama_produk,
          qty_po: parseQty(qty_po, "qty po"),
          qty_kurang: parseQty(qty_kurang, "qty kurang"),
          id_mesin_cetak,
          nama_mesin_cetak,
          tgl_cetak: parseTglCetak(tgl_cetak),
          jenis_kerusakan,
          note,
          id_create,
        },
        { transaction: t },
      );
      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: "create success",
        data: { id: data.id },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },

  updateInformasiKurangQtyService: async ({
    id,
    id_jo,
    no_jo,
    id_produk,
    nama_produk,
    qty_po,
    qty_kurang,
    id_mesin_cetak,
    nama_mesin_cetak,
    tgl_cetak,
    jenis_kerusakan,
    note,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      const data = await findActive(id, t);

      // field yang tidak dikirim tidak ikut diubah
      const payload = Object.fromEntries(
        Object.entries({
          id_jo,
          no_jo,
          id_produk,
          nama_produk,
          qty_po: parseQty(qty_po, "qty po"),
          qty_kurang: parseQty(qty_kurang, "qty kurang"),
          id_mesin_cetak,
          nama_mesin_cetak,
          tgl_cetak: parseTglCetak(tgl_cetak),
          jenis_kerusakan,
          note,
        }).filter(([, value]) => value !== undefined),
      );
      await data.update(payload, { transaction: t });

      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "update success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },

  deleteInformasiKurangQtyService: async ({ id, transaction = null }) => {
    const t = transaction || (await db.transaction());

    try {
      const data = await findActive(id, t);
      await data.update({ is_active: false }, { transaction: t });

      if (!transaction) await t.commit();
      return { status_code: 200, success: true, message: "delete success" };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw toServiceError(error);
    }
  },
};

async function findActive(id, transaction) {
  const data = await InformasiKurangQty.findByPk(id, { transaction });
  if (!data || !data.is_active) {
    throw {
      status_code: 404,
      message: "data informasi kurang qty tidak ditemukan",
    };
  }
  return data;
}

// undefined = tidak dikirim, "" / null = dikosongkan
function parseQty(value, fieldName) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const qty = Number(value);
  if (!Number.isFinite(qty) || qty < 0) {
    throw { status_code: 400, message: `${fieldName} harus berupa angka >= 0` };
  }
  return qty;
}

function parseTglCetak(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (Number.isNaN(new Date(value).getTime())) {
    throw { status_code: 400, message: "tgl cetak tidak valid" };
  }
  return value;
}

function toServiceError(error) {
  return {
    status_code: error.status_code || 500,
    success: false,
    message: error.message,
  };
}

module.exports = InformasiKurangQtyService;
