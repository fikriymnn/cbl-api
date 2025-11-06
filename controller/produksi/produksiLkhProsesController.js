const { Op, Sequelize, where } = require("sequelize");
const ProduksiLkhTahapan = require("../../model/produksi/produksiLkhTahapanModel");
const ProduksiLkhProses = require("../../model/produksi/produksiLkhProsesTesModel");
const MasterKodeProduksi = require("../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const ProduksiLkh = require("../../model/produksi/produksiLkhModel");
const ioMountingModel = require("../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../model/marketing/io/ioTahapanModel");
const MasterTahapanMesin = require("../../model/masterData/tahapan/masterTahapanMesinModel");
const SoModel = require("../../model/marketing/so/soModel");
const JobOrder = require("../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("../../model/ppic/jobOrder/joUserActionModel");
const Users = require("../../model/userModel");
const db = require("../../config/database");
const soModel = require("../../model/marketing/so/soModel");

const ProduksiLkhProsesController = {
  getProduksiLkhProses: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      id_produksi_lkh,
      id_produksi_lkh_tahapan,
      id_tahapan,
      id_mesin,
      id_operator,
      search,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { kode_produksi: { [Op.like]: `%${search}%` } },
          { deskripsi_kode: { [Op.like]: `%${search}%` } },
          { baik: { [Op.like]: `%${search}%` } },
          { rusak_sebagian: { [Op.like]: `%${search}%` } },
          { rusak_total: { [Op.like]: `%${search}%` } },
          { pallet: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (status) obj.status = status;
    if (id_produksi_lkh) obj.id_produksi_lkh = id_produksi_lkh;
    if (id_produksi_lkh_tahapan)
      obj.id_produksi_lkh_tahapan = id_produksi_lkh_tahapan;
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
        const length = await ProduksiLkhProses.count({ where: obj });
        const data = await ProduksiLkhProses.findAll({
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
        const data = await ProduksiLkhProses.findByPk(_id, {});
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await ProduksiLkhProses.findAll({
          order: [["createdAt", "DESC"]],
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

  startProduksiLkhProses: async (req, res) => {
    const { id_jo, id_tahapan, id_mesin, id_operator, id_kode_produksi } =
      req.body;
    const t = await db.transaction();

    try {
      const checkJo = await JobOrder.findByPk(id_jo);
      if (!checkJo)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data JO tidak ditemukan",
        });
      const checkProduksiLkh = await ProduksiLkh.findOne({
        where: {
          id_jo: id_jo,
          id_tahapan: id_tahapan,
          id_mesin: id_mesin,
          id_operator: id_operator,
        },
      });

      if (!checkProduksiLkh) {
        const dataProduksiLkhTahapan = await ProduksiLkhTahapan.findOne({
          id_jo: id_jo,
          id_tahapan: id_tahapan,
          is_active: true,
        });
        const dataProduksiLkh = await ProduksiLkh.create(
          {
            id_produksi_lkh_tahapan: dataProduksiLkhTahapan.id,
            id_jo: dataProduksiLkhTahapan.id_jo,
            id_io: dataProduksiLkhTahapan.id_io,
            id_so: dataProduksiLkhTahapan.id_so,
            id_customer: dataProduksiLkhTahapan.id_customer,
            id_produk: dataProduksiLkhTahapan.id_produk,
            id_tahapan: dataProduksiLkhTahapan.id_tahapan,
            id_mesin: id_mesin,
            id_operator: id_operator,
            no_jo: dataProduksiLkhTahapan.no_jo,
            no_io: dataProduksiLkhTahapan.no_io,
            no_so: dataProduksiLkhTahapan.no_so,
            customer: dataProduksiLkhTahapan.customer,
            produk: dataProduksiLkhTahapan.produk,
            tgl_kirim: dataProduksiLkhTahapan.tgl_kirim,
            qty_jo: dataProduksiLkhTahapan.qty_jo,
            spesifikasi: dataProduksiLkhTahapan.spesifikasi,
          },
          { transaction: t }
        );
        //crete lkh prosess
        const dataKodeProduksi = await MasterKodeProduksi.findByPk(
          id_kode_produksi
        );
        await ProduksiLkhProses.create(
          {
            id_produksi_lkh: dataProduksiLkh.id,
            id_produksi_lkh_tahapan: dataProduksiLkhTahapan.id,
            id_tahapan: dataProduksiLkhTahapan.id_tahapan,
            id_mesin: id_mesin,
            id_operator: id_operator,
            id_kode_produksi: id_kode_produksi,
            kode: dataKodeProduksi.kode,
            deskripsi: dataKodeProduksi.deskripsi,
            waktu_mulai: new Date(),
          },
          { transaction: t }
        );

        await t.commit();
        res.status(200).json({
          succes: true,
          status_code: 200,
          msg: "Start Successfully",
        });
      } else {
        //create lkh proses
        const dataKodeProduksi = await MasterKodeProduksi.findByPk(
          id_kode_produksi
        );
        await ProduksiLkhProses.create(
          {
            id_produksi_lkh: checkProduksiLkh.id,
            id_produksi_lkh_tahapan: checkProduksiLkh.id_produksi_lkh_tahapan,
            id_tahapan: checkProduksiLkh.id_tahapan,
            id_mesin: id_mesin,
            id_operator: id_operator,
            id_kode_produksi: id_kode_produksi,
            kode: dataKodeProduksi.kode,
            deskripsi: dataKodeProduksi.deskripsi,
            waktu_mulai: new Date(),
          },
          { transaction: t }
        );

        await t.commit();
        res.status(200).json({
          succes: true,
          status_code: 200,
          msg: "Start Successfully",
        });
      }
    } catch (error) {
      await t.rollback();
      console.log(error);
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  stopProduksiLkhProses: async (req, res) => {
    const _id = req.params.id;
    const { baik, rusak_sebagian, rusak_total, pallet, note } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await ProduksiLkhProses.findByPk(_id, {});
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      const start = new Date(checkData.waktu_mulai);
      const end = new Date();

      // hasil dalam detik
      const totalDetik = Math.floor((end - start) / 1000);

      await ProduksiLkhProses.update(
        {
          baik: baik,
          rusak_sebagian: rusak_sebagian,
          rusak_total: rusak_total,
          pallet: pallet,
          note: note,
          waktu_selesai: new Date(),
          total_waktu: totalDetik,
          status: "done",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Stop Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = ProduksiLkhProsesController;
