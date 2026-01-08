const { Op, fn, col, literal } = require("sequelize");
const MasterBarang = require("../../../model/masterData/barang/masterBarangModel");
const MasterBrand = require("../../../model/masterData/barang/masterBrandModel");
const MasterUnit = require("../../../model/masterData/barang/masterUnitModel");
const db = require("../../../config/database");

const MasterBarangController = {
  getMasterBarang: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search, kategori, sub_kategori } =
      req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { kode_barang: { [Op.like]: `%${search}%` } },
            { nama_barang: { [Op.like]: `%${search}%` } },
            { kategori: { [Op.like]: `%${search}%` } },
            { sub_kategori: { [Op.like]: `%${search}%` } },
            { harga: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (kategori) obj.kategori = kategori;
      if (sub_kategori) obj.sub_kategori = sub_kategori;
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MasterBarang.count({ where: obj });
        const data = await MasterBarang.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await MasterBarang.findByPk(_id, {
          include: [
            {
              model: MasterBrand,
              as: "brand",
            },
            {
              model: MasterUnit,
              as: "purchase_unit",
            },
            {
              model: MasterUnit,
              as: "inventory_unit",
            },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterBarang.findAll({ where: obj });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      }
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  getJenisKertas: async (req, res) => {
    try {
      const data = await MasterBarang.findAll({
        attributes: [
          "kategori",
          [fn("COUNT", col("id")), "total_item"], // hitung jumlah item per kategori
        ],
        where: {
          sub_kategori: {
            [Op.like]: "%kertas%", // cari sub_kategori yang mengandung 'kertas'
          },
        },
        group: ["kategori"],
      });
      res.status(200).json({ succes: true, status_code: 200, data: data });
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createMasterBarang: async (req, res) => {
    const {
      id_brand,
      id_purchase_unit,
      id_inventory_unit,
      kode_barang,
      nama_barang,
      kategori,
      sub_kategori,
      gramatur,
      panjang,
      lebar,
      harga,
      batas_harga,
      persentase,
      pajak,
      harga_per_satuan,
      inventory_convert,
      warehouse,
      keterangan,
    } = req.body;
    const t = await db.transaction();

    if (!nama_barang)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "nama barang wajib di isi!!",
      });

    try {
      if (id_brand) {
        const checkBrand = await MasterBrand.findByPk(id_brand);
        if (!checkBrand)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Brand tidak ditemukan",
          });
      }

      if (id_purchase_unit) {
        const checkPurchaseUnit = await MasterUnit.findByPk(id_purchase_unit);
        if (!checkPurchaseUnit)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Purchase Unit tidak ditemukan",
          });
      }

      if (id_inventory_unit) {
        const checkInventoryUnit = await MasterUnit.findByPk(id_inventory_unit);
        if (!checkInventoryUnit)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Inventory Unit tidak ditemukan",
          });
      }

      const lastBarang = await MasterBarang.findOne({
        attributes: ["kode_barang"],
        order: [
          [literal("CAST(SUBSTRING(kode_barang, 9) AS UNSIGNED)"), "DESC"],
        ],
      });

      let nextKodeBarang;
      const nextId = parseInt(lastBarang.kode_barang.substring(8), 10) + 1;

      if (!lastBarang) {
        nextKodeBarang = "CBL-ITEM00001";
      } else {
        const lastNumber = parseInt(lastBarang.kode_barang.substring(8), 10);
        const nextNumber = lastNumber + 1;

        nextKodeBarang = `CBL-ITEM${String(nextNumber).padStart(5, "0")}`;
      }

      const response = await MasterBarang.create(
        {
          id: nextId,
          id_brand: id_brand || null,
          id_purchase_unit: id_purchase_unit || null,
          id_inventory_unit: id_inventory_unit || null,
          kode_barang: nextKodeBarang || null,
          nama_barang: nama_barang || null,
          kategori: kategori || null,
          sub_kategori: sub_kategori || null,
          gramatur: gramatur || 0,
          panjang: panjang || 0,
          lebar: lebar || 0,
          harga: harga || 0,
          batas_harga: batas_harga || 0,
          persentase: persentase || 0,
          pajak: pajak || 0,
          harga_per_satuan: harga_per_satuan || 0,
          inventory_convert: inventory_convert || 0,
          warehouse: warehouse || null,
          keterangan: keterangan || null,
        },
        { transaction: t }
      );
      await t.commit();
      return res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successful",
        data: response,
      });
    } catch (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  updateMasterBarang: async (req, res) => {
    const _id = req.params.id;
    const {
      id_brand,
      id_purchase_unit,
      id_inventory_unit,
      kode_barang,
      nama_barang,
      kategori,
      sub_kategori,
      gramatur,
      panjang,
      lebar,
      harga,
      batas_harga,
      persentase,
      pajak,
      harga_per_satuan,
      inventory_convert,
      warehouse,
      keterangan,
      is_active,
    } = req.body;
    const t = await db.transaction();

    try {
      let obj = { persentase: persentase, pajak: pajak, harga: harga };
      if (kode_barang) obj.kode_barang = kode_barang;
      if (nama_barang) obj.nama_barang = nama_barang;
      if (kategori) obj.kategori = kategori;
      if (sub_kategori) obj.sub_kategori = sub_kategori;
      if (gramatur) obj.gramatur = gramatur;
      if (panjang) obj.panjang = panjang;
      if (lebar) obj.lebar = lebar;
      if (batas_harga) obj.batas_harga = batas_harga;
      if (harga_per_satuan) obj.harga_per_satuan = harga_per_satuan;
      if (inventory_convert) obj.inventory_convert = inventory_convert;
      if (warehouse) obj.warehouse = warehouse;
      if (keterangan) obj.keterangan = keterangan;
      if (is_active) obj.is_active = is_active;
      if (id_brand) {
        const checkBrand = await MasterBrand.findByPk(id_brand);
        if (!checkBrand)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Brand tidak ditemukan",
          });
        obj.id_brand = id_brand;
      }
      if (id_purchase_unit) {
        const checkPurchaseUnit = await MasterUnit.findByPk(id_purchase_unit);
        if (!checkPurchaseUnit)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Purchase Unit tidak ditemukan",
          });
        obj.id_purchase_unit = id_purchase_unit;
      }

      if (id_inventory_unit) {
        const checkInventoryUnit = await MasterUnit.findByPk(id_inventory_unit);
        if (!checkInventoryUnit)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Purchase Unit tidak ditemukan",
          });
        obj.id_inventory_unit = id_inventory_unit;
      }

      const checkData = await MasterBarang.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterBarang.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  deleteMasterBarang: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterBarang.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterBarang.destroy({
        where: { id: _id },
        transaction: t,
      }),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Delete Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = MasterBarangController;
