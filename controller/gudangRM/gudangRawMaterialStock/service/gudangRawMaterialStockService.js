const db = require("../../../../config/database");
const { Op } = require("sequelize");
const GudangRawMaterialStock = require("../../../../model/gudangRM/gudangRawMaterialStock/gudangRawMaterialStockModel");
const GudangRawMaterialStockMutasi = require("../../../../model/gudangRM/gudangRawMaterialStock/gudangRawMaterialStockMutasiModel");
const MasterBarang = require("../../../../model/masterData/barang/masterBarangModel");
const Users = require("../../../../model/userModel");

// NOTE: sesuaikan path require di atas dengan lokasi file model kamu yang sebenarnya.

const GudangRawMaterialStockService = {
  // get hanya ambil data gudang stock nya saja
  // jika get by id -> include mutasinya
  getGudangRawMaterialStockService: async ({
    id,
    page,
    limit,
    start_date,
    end_date,
    search,
    id_item,
    tipe_barang,
  }) => {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};

    if (search) {
      obj = {
        [Op.or]: [
          { kode_item: { [Op.like]: `%${search}%` } },
          { nama_item: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    if (id_item) obj.id_item = id_item;
    if (tipe_barang) obj.tipe_barang = tipe_barang;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }

    obj.is_active = true;

    try {
      if (id) {
        // get by id -> include mutasi
        const data = await GudangRawMaterialStock.findByPk(id, {
          include: [
            {
              model: MasterBarang,
              as: "master_barang",
            },
            {
              model: GudangRawMaterialStockMutasi,
              as: "gudang_raw_material_stock_mutasi",
              include: [
                {
                  model: Users,
                  as: "user",
                },
              ],
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
        };
      } else if (page && limit) {
        const length = await GudangRawMaterialStock.count({ where: obj });
        const data = await GudangRawMaterialStock.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: MasterBarang,
              as: "master_barang",
            },
          ],
        });
        return {
          status: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        };
      } else {
        const data = await GudangRawMaterialStock.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: MasterBarang,
              as: "master_barang",
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

  // create stock
  // jika sudah ada data dengan id_item (is_active true) -> update saja (qty ditambah, tgl_masuk diperbarui)
  // jika belum ada -> create baru
  // setelah itu selalu buat mutasi dengan type_mutasi "masuk" dan sumber_mutasi "normal"
  createGudangRawMaterialStockService: async ({
    id_item,
    qty,
    tipe_barang,
    satuan,
    id_user,
    transaction = null,
  }) => {
    const t = transaction || (await db.transaction());

    try {
      if (!id_item) {
        if (!transaction) await t.rollback();
        return {
          status_code: 400,
          success: false,
          message: "id_item tidak boleh kosong",
        };
      }

      const dataItem = await MasterBarang.findByPk(id_item, {
        transaction: t,
      });
      if (!dataItem) {
        if (!transaction) await t.rollback();
        return {
          status_code: 404,
          success: false,
          message: "Data Barang Tidak Ditemukan",
        };
      }

      // cek data existing berdasarkan id_item
      const existingData = await GudangRawMaterialStock.findOne({
        where: {
          id_item,
          is_active: true,
        },
        transaction: t,
      });

      let idGudangStock;

      if (existingData) {
        const newQty = (existingData.qty || 0) + (qty || 0);

        await GudangRawMaterialStock.update(
          {
            qty: newQty,
            tgl_masuk: new Date(),
          },
          { where: { id: existingData.id }, transaction: t },
        );

        idGudangStock = existingData.id;
      } else {
        const newData = await GudangRawMaterialStock.create(
          {
            id_item,
            kode_item: dataItem?.kode_barang || null,
            nama_item: dataItem?.nama_barang || null,
            qty: qty || 0,
            tipe_barang: tipe_barang || null,
            satuan: satuan || null,
            tgl_masuk: new Date(),
            is_active: true,
          },
          { transaction: t },
        );

        idGudangStock = newData.id;
      }

      // buat mutasi masuk
      await GudangRawMaterialStockMutasi.create(
        {
          id_gudang_raw_material_stock: idGudangStock,
          id_item,
          id_user: id_user || null,
          kode_barang: dataItem?.kode_barang || null,
          nama_barang: dataItem?.nama_barang || null,
          jumlah_qty: qty || 0,
          type_mutasi: "masuk",
          sumber_mutasi: "normal",
          tgl_mutasi: new Date(),
          is_active: true,
        },
        { transaction: t },
      );

      if (!transaction) await t.commit();
      return {
        status_code: 200,
        success: true,
        message: existingData ? "update success" : "create success",
        data: { id: idGudangStock },
      };
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = GudangRawMaterialStockService;
