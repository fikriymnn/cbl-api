const { Op, fn, col, literal } = require("sequelize");
const MasterProduk = require("../../../model/masterData/marketing/masterProdukModel");
const MasterCustomer = require("../../../model/masterData/marketing/masterCustomerModel");
const db = require("../../../config/database");

const MasterProdukController = {
  getMasterProduk: async (req, res) => {
    const id = req.params.id;
    const { is_active, page, limit, search, id_customer } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { kode: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { keterangan: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (id_customer) obj.id_customer = id_customer;
      if (page && limit) {
        const length = await MasterProduk.count({ where: obj });
        const data = await MasterProduk.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const response = await MasterProduk.findByPk(id, {
          include: { model: MasterCustomer, as: "customer" },
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterProduk.findAll({ where: obj });
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

  createMasterProduk: async (req, res) => {
    const { kode, nama_produk, id_customer, keterangan } = req.body;
    const t = await db.transaction();

    try {
      // if (!kode)
      //   return res.status(404).json({
      //     succes: false,
      //     status_code: 404,
      //     msg: "kode wajib di isi!!",
      //   });
      if (!nama_produk)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "nama produk wajib di isi!!",
        });

      if (id_customer) {
        const checkCustomer = await MasterCustomer.findByPk(id_customer);
        if (!checkCustomer)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Customer tidak ditemukan",
          });
      }

      const lastProduk = await MasterProduk.findOne({
        attributes: ["kode"],
        order: [
          // ambil angka di belakang P- lalu urutkan DESC
          [literal("CAST(SUBSTRING(kode, 3) AS UNSIGNED)"), "DESC"],
        ],
      });

      let nextKode;
      const nextId = parseInt(lastProduk.kode.substring(2), 10) + 1;

      if (!lastProduk) {
        // jika belum ada data
        nextKode = "P-00001";
      } else {
        const lastNumber = parseInt(lastProduk.kode.substring(2), 10);
        const nextNumber = lastNumber + 1;

        nextKode = `P-${String(nextNumber).padStart(5, "0")}`;
      }

      const response = await MasterProduk.create(
        {
          id: nextId,
          kode: nextKode,
          nama_produk: nama_produk,
          id_customer: id_customer || null,
          keterangan: keterangan,
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

  updateMasterProduk: async (req, res) => {
    const _id = req.params.id;
    const { kode, nama_produk, id_customer, keterangan, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (kode) obj.kode = kode;
      if (nama_produk) obj.nama_produk = nama_produk;
      if (keterangan) obj.keterangan = keterangan;
      if (is_active) obj.is_active = is_active;
      if (id_customer) {
        const checkCustomer = await MasterCustomer.findByPk(id_customer);
        if (!checkCustomer)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Customer tidak ditemukan",
          });
        obj.id_customer = id_customer;
      }
      const checkData = await MasterProduk.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterProduk.update(obj, { where: { id: _id }, transaction: t });
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

  deleteMasterProduk: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterProduk.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterProduk.destroy({ where: { id: _id }, transaction: t }),
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

module.exports = MasterProdukController;
