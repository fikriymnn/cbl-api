const { Op, Sequelize, where } = require("sequelize");
const ProduksiLkhTahapan = require("../../model/produksi/produksiLkhTahapanModel");
const ProduksiLkh = require("../../model/produksi/produksiLkhModel");
const ProduksiLkhProses = require("../../model/produksi/produksiLkhProsesModel");
const ProduksiLkhWaste = require("../../model/produksi/produksiLkhWasteModel");
const ioMountingModel = require("../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../model/marketing/io/ioTahapanModel");
const MasterTahapanMesin = require("../../model/masterData/tahapan/masterTahapanMesinModel");
const MasterMesinTahapan = require("../../model/masterData/tahapan/masterMesinTahapanModel");
const MasterTahapan = require("../../model/masterData/tahapan/masterTahapanModel");
const MasterKodeProduksi = require("../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const SoModel = require("../../model/marketing/so/soModel");
const JobOrder = require("../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("../../model/ppic/jobOrder/joUserActionModel");
const Users = require("../../model/userModel");
const db = require("../../config/database");
const soModel = require("../../model/marketing/so/soModel");
const {
  creteProduksiJoDoneService,
} = require("./service/produksiJoDoneService");

const {
  createPembuatanStandarWarnaService,
} = require("../../controller/ppic/pembuatanStandarWarna/service/pembuatanSetandarWarnaService");

const ProduksiLkhTahapanController = {
  getProduksiLkhTahapan: async (req, res) => {
    const _id = req.params.id;
    const {
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
      tahapan_bawahan,
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
    if (status) obj.status = status;
    if (id_jo) obj.id_jo = id_jo;
    if (id_io) obj.id_io = id_io;
    if (id_so) obj.id_so = id_so;
    if (id_customer) obj.id_customer = id_customer;
    if (id_produk) obj.id_produk = id_produk;
    if (tahapan_bawahan) obj.id_tahapan = { [Op.in]: tahapan_bawahan };

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
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_kh",
              include: [
                {
                  model: ProduksiLkhProses,
                  as: "produksi_lkh_proses",
                },
                {
                  model: ProduksiLkhWaste,
                  as: "produksi_lkh_waste",
                },
              ],
            },
            {
              model: SoModel,
              as: "so",
              attributes: ["po_qty"],
            },
          ],
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await ProduksiLkhTahapan.findByPk(_id, {
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_kh",
              include: [
                {
                  model: ProduksiLkhProses,
                  as: "produksi_lkh_proses",
                },
                {
                  model: ProduksiLkhWaste,
                  as: "produksi_lkh_waste",
                },
              ],
            },
            {
              model: SoModel,
              as: "so",
              attributes: ["po_qty"],
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await ProduksiLkhTahapan.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_lkh",
              include: [
                {
                  model: ProduksiLkhProses,
                  as: "produksi_lkh_proses",
                },
                {
                  model: ProduksiLkhWaste,
                  as: "produksi_lkh_waste",
                },
                {
                  model: Users,
                  as: "operator",
                },
              ],
            },
            {
              model: ProduksiLkhProses,
              as: "produksi_lkh_proses",
              include: [
                {
                  model: Users,
                  as: "operator",
                },
              ],
            },
            {
              model: MasterTahapan,
              as: "tahapan",
            },
          ],
          where: obj,
        });

        // Ambil semua id_jo yang unik dari data
        const idJoList = [...new Set(data.map((item) => item.id_jo))];

        // Fetch semua ProduksiLkhWaste berdasarkan id_jo sekaligus
        const wasteData = await ProduksiLkhWaste.findAll({
          where: {
            id_jo: idJoList,
          },
        });

        // Group waste data berdasarkan id_jo
        const wasteGroupedByIdJo = wasteData.reduce((acc, waste) => {
          const idJo = waste.id_jo;
          if (!acc[idJo]) acc[idJo] = [];
          acc[idJo].push(waste);
          return acc;
        }, {});

        // Map data dan tambahkan field produksi_lkh_waste
        const result = data.map((item) => ({
          ...item.toJSON(),
          produksi_lkh_waste: wasteGroupedByIdJo[item.id_jo] || [],
        }));

        return res.status(200).json({
          data: result,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMesinByJO: async (req, res) => {
    const { no_jo } = req.query;
    try {
      const data = await ProduksiLkhTahapan.findAll({
        order: [["createdAt", "DESC"]],
        where: { no_jo: no_jo },
        include: [
          {
            model: MasterTahapan,
            as: "tahapan",
            attributes: ["nama_tahapan"],
          },
          {
            model: ProduksiLkhProses,
            as: "produksi_lkh_proses",
            attributes: ["id_mesin", "id_operator"],
            include: [
              {
                model: Users,
                as: "operator",
                attributes: ["nama"],
              },
              {
                model: MasterMesinTahapan,
                as: "mesin",
                attributes: ["nama_mesin"],
              },
            ],
          },
        ],
      });

      // Flatten semua tahapan + proses menjadi array flat
      const result = [];

      data.forEach((tahapan) => {
        const seen = new Set();
        const namaTahapan = tahapan.tahapan?.nama_tahapan ?? "-";

        tahapan.produksi_lkh_proses.forEach((proses) => {
          const key = `${proses.id_mesin}-${proses.id_operator}`;
          if (seen.has(key)) return;
          seen.add(key);

          result.push({
            proses: namaTahapan,
            mesin: proses.mesin?.nama_mesin ?? "-",
            operator: proses.operator?.nama ?? "-",
          });
        });
      });

      return res.status(200).json({
        status_code: 200,
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveProduksiLkhTahapan: async (req, res) => {
    const _id = req.params.id;
    const { produksi_lkh_proses, produksi_lkh_waste } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await ProduksiLkhTahapan.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      const checkDataJo = await JobOrder.findByPk(checkData.id_jo);

      if (!checkDataJo)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: " jo tidak ditemukan",
        });

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
          },
        );
      }

      if (produksi_lkh_waste) {
        for (let i = 0; i < produksi_lkh_waste.length; i++) {
          const e = produksi_lkh_waste[i];
          const dataWaste = await MasterKodeProduksi.findByPk(e.id_waste);
          const dataKendala = await MasterKodeProduksi.findByPk(e.id_kendala);
          await ProduksiLkhWaste.update(
            {
              total_qty: e.total_qty,
              id_kendala: e.id_kendala,
              kode_kendala: dataKendala.kode,
              deskripsi_kendala: dataKendala.deskripsi,
              id_waste: e.id_waste,
              kode_waste: dataWaste.kode,
              deskripsi_waste: dataWaste.deskripsi,
            },
            {
              where: { id: e.id },
              transaction: t,
            },
          );
        }
      }

      //buat tahapan yg di approve jadi done
      await ProduksiLkhTahapan.update(
        {
          status: "done",
          id_approve: req.user.id,
          tgl_approve: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      //buat tahapan selanjutnya jadi active & cek apakah tahapan ini adalah tahapan terakhir (untuk kirim tiket ke list jo selesai)
      const checkDataLkhtahapanNext = await ProduksiLkhTahapan.findOne({
        where: {
          id_jo: checkData.id_jo,
          index: checkData.index + 1,
          is_active: true,
        },
      });

      if (checkDataLkhtahapanNext) {
        if (checkDataLkhtahapanNext.status == "nonactive") {
          //buat tahapan selanjutnya active
          await ProduksiLkhTahapan.update(
            { status: "active" },
            { where: { id: checkDataLkhtahapanNext.id }, transaction: t },
          );
        } else {
          //tahapan selanjutnya sudah active atau done maka tidak perlu update status
        }
      } else {
        if (
          checkDataJo.tipe_jo == "JO PROOF" ||
          checkDataJo.tipe_jo == "JO PROFF"
        ) {
          //jika tidak ada maka kirim tiket ke list pembuatan standar warna
          const createStandarWarna = await createPembuatanStandarWarnaService({
            id_jo: checkData.id_jo,
            id_io: checkData.id_io,
            id_so: checkData.id_so,
            id_customer: checkData.id_customer,
            id_produk: checkData.id_produk,
            transaction: t,
          });
          if (createStandarWarna.success === false) {
            await t.rollback();

            return res.status(400).json({
              succes: false,
              status_code: 400,
              msg: createStandarWarna.message,
            });
          }
        } else {
          //jika tidak ada maka kirim tiket ke list produksi jo selesai
          const createProduksiLkhProsesDone = await creteProduksiJoDoneService({
            id_jo: checkData.id_jo,
            id_io: checkData.id_io,
            id_so: checkData.id_so,
            id_customer: checkData.id_customer,
            id_produk: checkData.id_produk,
            transaction: t,
          });
          if (createProduksiLkhProsesDone.success === false) {
            await t.rollback();

            return res.status(400).json({
              succes: false,
              status_code: 400,
              msg: createProduksiLkhProsesDone.message,
            });
          }
        }
      }

      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" }));
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  activedProduksiLkhTahapan: async (req, res) => {
    const { produksi_lkh_tahapan } = req.body;
    const t = await db.transaction();
    try {
      for (let i = 0; i < produksi_lkh_tahapan.length; i++) {
        const e = produksi_lkh_tahapan[i];
        const checkData = await ProduksiLkhTahapan.findByPk(e.id);
        if (checkData.status == "nonactive") {
          await ProduksiLkhTahapan.update(
            {
              status: e.status,
            },
            {
              where: { id: e.id },
              transaction: t,
            },
          );
        }
      }

      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Actived Successful" }));
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = ProduksiLkhTahapanController;
