const { Op } = require("sequelize");
const MasterCustomer = require("../../../model/masterData/marketing/masterCustomerModel");
const MasterProduk = require("../../../model/masterData/marketing/masterProdukModel");
const MasterHargaPengiriman = require("../../../model/masterData/marketing/masterHargaPengirimanModel");
const MasterMarketing = require("../../../model/masterData/marketing/masterMarketingModel");
const db = require("../../../config/database");

const MasterCustomerController = {
  getMasterCustomer: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { kode_marketing: { [Op.like]: `%${search}%` } },
            { nama_customer: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { alamat_kantor: { [Op.like]: `%${search}%` } },
            { telepon: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MasterCustomer.count({ where: obj });
        const data = await MasterCustomer.findAll({
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
        const response = await MasterCustomer.findByPk(_id, {
          include: [
            {
              model: MasterMarketing,
              as: "marketing",
            },
            {
              model: MasterHargaPengiriman,
              as: "harga_pengiriman",
            },
            {
              model: MasterProduk,
              as: "produk",
            },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterCustomer.findAll({
          where: obj,
        });
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

  createMasterCustomer: async (req, res) => {
    const {
      id_marketing,
      id_produk,
      id_harga_pengiriman,
      nama_customer,
      email,
      alamat_kantor,
      alamat_gudang,
      telepon,
      toleransi_pengiriman,
      top_faktur,
    } = req.body;
    const t = await db.transaction();
    try {
      let dataMarketing = null;
      if (!nama_customer)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "nama customer wajib di isi!!",
        });
      if (!alamat_kantor)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "alamat kantor wajib di isi!!",
        });

      if (id_produk) {
        const checkDataProduk = await MasterProduk.findByPk(id_produk);
        if (!checkDataProduk)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "produk tidak ditemukan!!",
          });
      }

      if (id_marketing) {
        dataMarketing = await MasterMarketing.findByPk(id_marketing);
        if (!dataMarketing)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "marketing tidak ditemukan!!",
          });
      }

      if (id_harga_pengiriman) {
        const checkDataPengiriman = await MasterHargaPengiriman.findByPk(
          id_harga_pengiriman
        );
        if (!checkDataPengiriman)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "pengiriman tidak ditemukan!!",
          });
      }

      const response = await MasterCustomer.create(
        {
          id_marketing,
          id_produk,
          id_harga_pengiriman,
          nama_customer,
          email,
          alamat_kantor,
          alamat_gudang,
          telepon,
          toleransi_pengiriman,
          top_faktur,
          kode_marketing: dataMarketing ? dataMarketing.kode : null,
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

  updateMasterCustomer: async (req, res) => {
    const _id = req.params.id;
    const {
      id_marketing,
      id_produk,
      id_harga_pengiriman,
      nama_customer,
      email,
      alamat_kantor,
      alamat_gudang,
      telepon,
      toleransi_pengiriman,
      top_faktur,
      is_active,
    } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (id_produk) {
        const checkProduk = await MasterProduk.findByPk(id_produk);
        if (!checkProduk)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data produk tidak ditemukan",
          });
        obj.id_produk = id_produk;
      }
      if (id_marketing) {
        const checkMarketing = await MasterMarketing.findByPk(id_marketing);
        if (!checkMarketing)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data marketing tidak ditemukan",
          });
        obj.id_marketing = id_marketing;
        obj.kode_marketing = checkMarketing.kode;
      }
      if (id_harga_pengiriman) {
        const checkPengiriman = await MasterHargaPengiriman.findByPk(
          id_harga_pengiriman
        );
        if (!checkPengiriman)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data pengiriman tidak ditemukan",
          });
        obj.id_harga_pengiriman = id_harga_pengiriman;
      }
      if (nama_customer) obj.nama_customer = nama_customer;
      if (email) obj.email = email;
      if (alamat_kantor) obj.alamat_kantor = alamat_kantor;
      if (alamat_gudang) obj.alamat_gudang = alamat_gudang;
      if (telepon) obj.telepon = telepon;
      if (toleransi_pengiriman) obj.toleransi_pengiriman = toleransi_pengiriman;
      if (top_faktur) obj.top_faktur = top_faktur;
      if (is_active) obj.is_active = is_active;

      const checkData = await MasterCustomer.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data customer tidak ditemukan",
        });
      await MasterCustomer.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await t.commit(),
        res
          .status(204)
          .json({ succes: true, status_code: 204, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  deleteMasterCustomer: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterCustomer.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterCustomer.destroy({
        where: { id: _id },
        transaction: t,
      }),
        await t.commit(),
        res
          .status(204)
          .json({ succes: true, status_code: 204, msg: "Delete Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = MasterCustomerController;
