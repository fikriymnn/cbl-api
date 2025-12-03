const { Op, Sequelize, where } = require("sequelize");
const ProduksiLkhTahapan = require("../../model/produksi/produksiLkhTahapanModel");
const ProduksiLkh = require("../../model/produksi/produksiLkhModel");
const ProduksiLkhProses = require("../../model/produksi/produksiLkhProsesModel");
const ioMountingModel = require("../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../model/marketing/io/ioTahapanModel");
const MasterTahapan = require("../../model/masterData/tahapan/masterTahapanModel");
const SoModel = require("../../model/marketing/so/soModel");
const JobOrder = require("../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("../../model/ppic/jobOrder/joUserActionModel");
const Users = require("../../model/userModel");
const db = require("../../config/database");
const soModel = require("../../model/marketing/so/soModel");

const ProduksiLkhController = {
  getProduksiLkh: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      status_proses,
      status_lkh_proses,
      search,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
      id_tahapan,
      id_mesin,
      id_operator,
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
    if (id_tahapan) obj.id_tahapan = id_tahapan;
    if (id_mesin) obj.id_mesin = id_mesin;
    if (id_operator) obj.id_operator = id_operator;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_pembuatan_bom = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await ProduksiLkh.count({ where: obj });
        const data = await ProduksiLkh.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          include: [
            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses",
              where: { status: "progress" },
              required: false,
            },
          ],
          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await ProduksiLkh.findByPk(_id, {
          include: [
            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await ProduksiLkh.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses",
              where: { status: status_lkh_proses ?? "progress" },
              required: false,
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  finishProduksiLkh: async (req, res) => {
    const _id = req.params.id;
    const {
      id_produksi_lkh_tahapan,
      send_request_to_spv,
      produksi_lkh_proses,
    } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await ProduksiLkhTahapan.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      await ProduksiLkh.update(
        { status: "done" },
        { where: { id: _id }, transaction: t }
      );

      const findFinishJo = produksi_lkh_proses.find((e) => e.kode == "5.2");

      if (findFinishJo) {
        await ProduksiLkhTahapan.update(
          {
            status: "request to spv",
          },
          {
            where: { id: id_produksi_lkh_tahapan },
            transaction: t,
          }
        );
      }

      for (let i = 0; i < produksi_lkh_proses.length; i++) {
        const e = produksi_lkh_proses[i];
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

      const finalResult = getValidLatestData(produksi_lkh_proses);

      if (finalResult) {
        await ProduksiLkhProses.update(
          { is_final_result: true },
          { where: { id: finalResult.id }, transaction: t }
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

  getProduksiLkhAllData: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, status, search } = req.query;
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

    if (status) obj.status = status;

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.createdAt = { [Op.between]: [startDate, endDate] };
    }
    obj.is_active = true;
    try {
      if (page && limit) {
        const length = await JobOrder.count({ where: obj });
        const data = await JobOrder.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses",
              where: { is_active: true },
              required: false,
              include: [
                {
                  model: MasterTahapan,
                  as: "tahapan",
                },
                {
                  model: Users,
                  as: "operator",
                },
              ],
            },
          ],
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await JobOrder.findByPk(_id, {
          include: [
            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses",
              where: { is_active: true },
              required: false,
              include: [
                {
                  model: MasterTahapan,
                  as: "tahapan",
                },
                {
                  model: Users,
                  as: "operator",
                },
              ],
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await JobOrder.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses",
              where: { is_active: true },
              required: false,
              include: [
                {
                  model: MasterTahapan,
                  as: "tahapan",
                },
                {
                  model: Users,
                  as: "operator",
                },
              ],
            },
          ],
        });
        return res.status(200).json({
          status_code: 200,
          success: true,
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  // approveProduksiLkh: async (req, res) => {
  //   const _id = req.params.id;
  //   const t = await db.transaction();
  //   try {
  //     const checkData = await ProduksiLkh.findByPk(_id);
  //     if (!checkData)
  //       return res.status(404).json({
  //         succes: false,
  //         status_code: 404,
  //         msg: "Data tidak ditemukan",
  //       });

  //     await ProduksiLkh.update(
  //       {
  //         status: "done",
  //       },
  //       {
  //         where: { id: _id },
  //         transaction: t,
  //       }
  //     ),
  //       await t.commit(),
  //       res
  //         .status(200)
  //         .json({ succes: true, status_code: 200, msg: "Approve Successful" });
  //   } catch (error) {
  //     res
  //       .status(400)
  //       .json({ succes: true, status_code: 400, msg: error.message });
  //   }
  // },
};

function getValidLatestData(data) {
  // Filter data yang baik tidak 0
  const validData = data.filter((item) => item.baik !== 0);

  // Jika tidak ada data valid, return null
  if (validData.length === 0) {
    return null;
  }

  // Sort berdasarkan createdAt descending (terbaru di atas)
  const sortedData = validData.sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Ambil data paling baru (index 0)
  return sortedData[0];
}

module.exports = ProduksiLkhController;
