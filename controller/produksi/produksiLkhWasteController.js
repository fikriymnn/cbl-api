const { Op, Sequelize, where } = require("sequelize");
const ProduksiLkhTahapan = require("../../model/produksi/produksiLkhTahapanModel");
const ProduksiLkhWaste = require("../../model/produksi/produksiLkhWasteModel");
const MasterKodeProduksi = require("../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterKategoriKendala = require("../../model/masterData/kodeProduksi/masterKategoriKendalaModel");
const MasterTahapan = require("../../model/masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../../model/masterData/tahapan/masterMesinTahapanModel");
const MasterKriteriaKendala = require("../../model/masterData/kodeProduksi/masterKriteriaKendalaModel");
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
const masterShift = require("../../model/masterData/hr/masterShift/masterShiftModel");
const {
  creteTicketMtcOs2Service,
} = require("../mtc/ticketMaintenance/ticketMaintenanceService");

const ProduksiLkhWasteController = {
  getProduksiLkhWaste: async (req, res) => {
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
      is_approved_svp,
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
    if (is_approved_svp) obj.status = "request to spv";

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_pembuatan_bom = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await ProduksiLkhWaste.count({ where: obj });
        const data = await ProduksiLkhWaste.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_lkh",
            },
            {
              model: Users,
              as: "operator",
            },
          ],
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await ProduksiLkhWaste.findByPk(_id, {
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_lkh",
            },
            {
              model: Users,
              as: "operator",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await ProduksiLkhWaste.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_lkh",
            },
            {
              model: Users,
              as: "operator",
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

  createProduksiLkhWaste: async (req, res) => {
    const {
      id_jo,
      id_tahapan,
      id_mesin,
      id_operator,
      id_kendala,
      id_waste,
      total_qty,
    } = req.body;
    const t = await db.transaction();

    try {
      const checkJo = await JobOrder.findByPk(id_jo, {
        include: [
          {
            model: JobOrderMounting,
            as: "jo_mounting",
            where: { is_active: true },
            required: false,
          },
        ],
      });

      const checkIoMounting = await ioMountingModel.findByPk(
        checkJo.jo_mounting[0].id_io_mounting,
      );
      const checkProduksiLkh = await ProduksiLkh.findOne({
        where: {
          id_jo: id_jo,
          id_tahapan: id_tahapan,
          id_mesin: id_mesin,
          id_operator: id_operator,
        },
        include: [
          {
            model: MasterTahapan,
            as: "tahapan",
          },
        ],
      });

      const checkMasterMesin = await MasterMesinTahapan.findByPk(id_mesin);
      if (!checkMasterMesin) {
        return res.status(404).json({
          success: false,
          status_code: 404,
          msg: "Mesin tidak ditemukan",
        });
      }

      const dataKodeKendala = await MasterKodeProduksi.findByPk(id_kendala, {
        include: [
          {
            model: MasterKategoriKendala,
            as: "kategori_kendala",
          },
          {
            model: MasterKriteriaKendala,
            as: "kriteria_qty_mtc",
          },
          {
            model: MasterKriteriaKendala,
            as: "kriteria_waktu_mtc",
          },
          {
            model: MasterKriteriaKendala,
            as: "kriteria_frekuensi_mtc",
          },
        ],
      });

      if (!dataKodeKendala) {
        return res.status(404).json({
          success: false,
          status_code: 404,
          msg: "Kode kendala tidak ditemukan",
        });
      }

      const dataKodeWaste = await MasterKodeProduksi.findByPk(id_waste, {
        include: [
          {
            model: MasterKategoriKendala,
            as: "kategori_kendala",
          },
          {
            model: MasterKriteriaKendala,
            as: "kriteria_qty_mtc",
          },
          {
            model: MasterKriteriaKendala,
            as: "kriteria_waktu_mtc",
          },
          {
            model: MasterKriteriaKendala,
            as: "kriteria_frekuensi_mtc",
          },
        ],
      });

      if (!dataKodeWaste) {
        return res.status(404).json({
          success: false,
          status_code: 404,
          msg: "Kode waste tidak ditemukan",
        });
      }

      if (!checkProduksiLkh) {
        const dataProduksiLkhTahapan = await ProduksiLkhTahapan.findOne({
          where: {
            id_jo: id_jo,
            id_tahapan: id_tahapan,
            is_active: true,
          },
          include: [
            {
              model: MasterTahapan,
              as: "tahapan",
            },
          ],
        });

        if (!dataProduksiLkhTahapan) {
          return res.status(404).json({
            success: false,
            status_code: 404,
            msg: "Data Produksi LKH Tahapan tidak ditemukan",
          });
        }

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
          { transaction: t },
        );
        //crete lkh waste
        await ProduksiLkhWaste.create(
          {
            id_jo: id_jo,
            id_produksi_lkh: dataProduksiLkh.id,
            id_produksi_lkh_tahapan: dataProduksiLkhTahapan.id,
            id_tahapan: dataProduksiLkhTahapan.id_tahapan,
            id_mesin: id_mesin,
            id_operator: id_operator,
            id_kendala: id_kendala,
            kode_kendala: dataKodeKendala.kode,
            deskripsi_kendala: dataKodeKendala.deskripsi,
            id_waste: id_waste,
            kode_waste: dataKodeWaste.kode,
            deskripsi_waste: dataKodeWaste.deskripsi,
            proses: dataKodeWaste.proses_produksi,
            total_qty: total_qty,
          },
          { transaction: t },
        );

        await t.commit();
        res.status(200).json({
          succes: true,
          status_code: 200,
          msg: "Start Successfully",
        });
      } else {
        //crete lkh waste
        await ProduksiLkhWaste.create(
          {
            id_jo: id_jo,
            id_produksi_lkh: checkProduksiLkh.id,
            id_produksi_lkh_tahapan: checkProduksiLkh.id_produksi_lkh_tahapan,
            id_tahapan: checkProduksiLkh.id_tahapan,
            id_mesin: id_mesin,
            id_operator: id_operator,
            id_kendala: id_kendala,
            kode_kendala: dataKodeKendala.kode,
            deskripsi_kendala: dataKodeKendala.deskripsi,
            id_waste: id_waste,
            kode_waste: dataKodeWaste.kode,
            deskripsi_waste: dataKodeWaste.deskripsi,
            proses: dataKodeWaste.proses_produksi,
            total_qty: total_qty,
          },
          { transaction: t },
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
};

module.exports = ProduksiLkhWasteController;
