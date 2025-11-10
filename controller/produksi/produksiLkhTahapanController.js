const { Op, Sequelize, where } = require("sequelize");
const ProduksiLkhTahapan = require("../../model/produksi/produksiLkhTahapanModel");
const ProduksiLkh = require("../../model/produksi/produksiLkhModel");
const ProduksiLkhProses = require("../../model/produksi/produksiLkhProsesModel");
const ioMountingModel = require("../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../model/marketing/io/ioTahapanModel");
const MasterTahapanMesin = require("../../model/masterData/tahapan/masterTahapanMesinModel");
const MasterTahapan = require("../../model/masterData/tahapan/masterTahapanModel");
const SoModel = require("../../model/marketing/so/soModel");
const JobOrder = require("../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("../../model/ppic/jobOrder/joUserActionModel");
const Users = require("../../model/userModel");
const db = require("../../config/database");
const soModel = require("../../model/marketing/so/soModel");

const ProduksiLkhTahapanController = {
  getProduksiLkhTahapan: async (req, res) => {
    const _id = req.params.id;
    const {
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
    } = req.query;

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
    if (status_proses) obj.status_tiket = status_tiket;
    if (status) obj.status = status;
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_pembuatan_bom = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await ProduksiLkhTahapan.count({ where: obj });
        const data = await ProduksiLkhTahapan.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),

          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await ProduksiLkhTahapan.findByPk(_id, {});
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await ProduksiLkhTahapan.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: MasterTahapan,
              as: "tahapan",
            },
          ],
          where: obj,
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  finishProduksiLkhTahapan: async (req, res) => {
    const _id = req.params.id;
    const { data_proses } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await ProduksiLkhTahapan.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      await ProduksiLkhTahapan.update(
        {
          status: "request to spv",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      for (let i = 0; i < data_proses.length; i++) {
        const e = data_proses[i];
        await ProduksiLkhProses.update(
          {
            baik: e.baik,
            rusak_sebagian: e.rusak_sebagian,
            rusak_total: e.rusak_total,
            pallet: e.pallet,
          },
          {
            where: { id: e.id },
            transaction: t,
          }
        );
      }
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  approveProduksiLkhTahapan: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await ProduksiLkhTahapan.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      //buat tahapan yg di approve jadi done
      await ProduksiLkhTahapan.update(
        {
          status: "done",
          id_approve: req.user.id,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      //buat tahapan selanjutnya jadi active
      const checkDataLkhtahapanNext = await ProduksiLkhTahapan.findOne({
        where: {
          id_jo: checkData.id_jo,
          index: checkData.index + 1,
          is_active: true,
        },
      });

      if (checkDataLkhtahapanNext) {
        await ProduksiLkhTahapan.update(
          { status: "active" },
          { where: { id: checkDataLkhtahapanNext.id }, transaction: t }
        );
      }
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = ProduksiLkhTahapanController;
