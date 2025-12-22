const InspeksiMasterPointFinal = require("../../../../model/masterData/qc/inspeksi/masterPointFinalModel");
const InspeksiMasterSubFinal = require("../../../../model/masterData/qc/inspeksi/masterSubFinalModel");
const InspeksiFinal = require("../../../../model/qc/inspeksi/final/inspeksiFinalModel");
const InspeksiFinalPoint = require("../../../../model/qc/inspeksi/final/inspeksiFinalPoint");
const InspeksiFinalSub = require("../../../../model/qc/inspeksi/final/inspeksiFinalSubModel");
const User = require("../../../../model/userModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const { Op } = require("sequelize");
const db = require("../../../../config/database");

const axios = require("axios");
const dotenv = require("dotenv");
const DeliveryOrderService = require("../../../deliveryOrder/service/deliveryOrderService");
const ProduksiJoDoneService = require("../../../produksi/service/produksiJoDoneService");

const inspeksiFinalController = {
  getInspeksiFinal: async (req, res) => {
    try {
      const {
        status,
        bagian_tiket,
        page,
        limit,
        search,
        start_date,
        end_date,
      } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (status) obj.status = status;
      if (bagian_tiket) obj.bagian_tiket = bagian_tiket;
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };
      if (start_date && end_date) {
        obj.createdAt = {
          [Op.between]: [
            new Date(start_date).setHours(0, 0, 0, 0),
            new Date(end_date).setHours(23, 59, 59, 999),
          ],
        };
      } else if (start_date) {
        obj.tgl = {
          [Op.gte]: new Date(start_date).setHours(0, 0, 0, 0), // Set jam startDate ke 00:00:00:00
        };
      } else if (end_date) {
        obj.tgl = {
          [Op.lte]: new Date(end_date).setHours(23, 59, 59, 999),
        };
      }
      if (page && limit) {
        const length = await InspeksiFinal.count({ where: obj });
        const data = await InspeksiFinal.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            { model: InspeksiFinalSub, as: "inspeksi_final_sub" },
            { model: InspeksiFinalPoint, as: "inspeksi_final_point" },
            { model: User, as: "data_inspector" },
          ],
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data1 = await InspeksiFinal.findByPk(id);

        // if (!data1.inspector) {
        //   await InspeksiFinal.update(
        //     { inspector: req.user.id },
        //     { where: { id: id } }
        //   );
        // }

        const data = await InspeksiFinal.findByPk(id, {
          include: [
            { model: InspeksiFinalSub, as: "inspeksi_final_sub" },
            { model: InspeksiFinalPoint, as: "inspeksi_final_point" },
            { model: User, as: "data_inspector" },
          ],
        });
        return res.status(200).json({ data });
      } else {
        const data = await InspeksiFinal.findAll({
          order: [["createdAt", "DESC"]],
          include: [{ model: User, as: "data_inspector" }],
          where: obj,
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiFinal: async (req, res) => {
    const {
      tanggal,
      no_jo,
      no_io,
      quantity,
      jam,
      nama_produk,
      customer,
      status_jo,
    } = req.body;
    const t = await db.transaction();
    try {
      const checkdata = await InspeksiFinal.findOne({
        where: { no_jo: no_jo, status: "incoming" },
      });
      // if (checkdata) {
      //   res
      //     .status(200)
      //     .json({
      //       msg: "JO sedang di proses oleh QC pada proses Final Inspection",
      //     });
      // } else {
      //   const qtyFinal = parseInt(quantity);
      //   const data = await InspeksiFinal.create({
      //     tanggal,
      //     no_jo,
      //     no_io,
      //     quantity,
      //     jam,
      //     nama_produk,
      //     customer,
      //     status_jo,
      //   });

      //   const masterSubFinal = await InspeksiMasterSubFinal.findOne({
      //     where: {
      //       [Op.and]: [
      //         { quantity_awal: { [Op.lte]: qtyFinal } },
      //         { quantity_akhir: { [Op.gte]: qtyFinal } },
      //       ],
      //     },
      //   });
      //   const masterPointFinal = await InspeksiMasterPointFinal.findAll({
      //     where: { status: "active" },
      //   });
      //   if (masterSubFinal) {
      //     await InspeksiFinalSub.create({
      //       id_inspeksi_final: data.id,
      //       quantity_awal: masterSubFinal.quantity_awal,
      //       quantity_akhir: masterSubFinal.quantity_akhir,
      //       jumlah: masterSubFinal.jumlah,
      //       kualitas_lulus: masterSubFinal.kualitas_lulus,
      //       kualitas_tolak: masterSubFinal.kualitas_tolak,
      //     });
      //   }

      //   for (let i = 0; i < masterPointFinal.length; i++) {
      //     await InspeksiFinalPoint.create({
      //       id_inspeksi_final: data.id,
      //       point: masterPointFinal[i].point,
      //       standar: masterPointFinal[i].standar,
      //       cara_periksa: masterPointFinal[i].cara_periksa,
      //     });
      //   }

      //   res.status(200).json({ msg: "create Successful" });
      // }
      const qtyFinal = parseInt(quantity);
      const data = await InspeksiFinal.create(
        {
          tanggal,
          no_jo,
          no_io,
          quantity,
          jam,
          nama_produk,
          customer,
          status_jo,
        },
        {
          transaction: t,
        }
      );

      const masterSubFinal = await InspeksiMasterSubFinal.findOne(
        {
          where: {
            [Op.and]: [
              { quantity_awal: { [Op.lte]: qtyFinal } },
              { quantity_akhir: { [Op.gte]: qtyFinal } },
            ],
          },
        },
        {
          transaction: t,
        }
      );
      const masterPointFinal = await InspeksiMasterPointFinal.findAll({
        where: { status: "active" },
      });
      if (masterSubFinal) {
        await InspeksiFinalSub.create(
          {
            id_inspeksi_final: data.id,
            quantity_awal: masterSubFinal.quantity_awal,
            quantity_akhir: masterSubFinal.quantity_akhir,
            jumlah: masterSubFinal.jumlah,
            kualitas_lulus: masterSubFinal.kualitas_lulus,
            kualitas_tolak: masterSubFinal.kualitas_tolak,
          },
          {
            transaction: t,
          }
        );
      }

      for (let i = 0; i < masterPointFinal.length; i++) {
        await InspeksiFinalPoint.create(
          {
            id_inspeksi_final: data.id,
            point: masterPointFinal[i].point,
            standar: masterPointFinal[i].standar,
            cara_periksa: masterPointFinal[i].cara_periksa,
          },
          {
            transaction: t,
          }
        );
      }

      await t.commit();
      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
      await t.rollback();
      res.status(404).json({ msg: error.message });
    }
  },

  startInspeksiFinal: async (req, res) => {
    const id = req.params.id;
    const date = new Date();
    try {
      await InspeksiFinal.update(
        { waktu_mulai: date, inspektor: req.user.id },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "start successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateInspeksiFinal: async (req, res) => {
    const t = await db.transaction();
    try {
      const { id } = req.params;
      const {
        no_pallet,
        no_packing,
        qty_packing,
        inspeksi_final_point,
        inspeksi_final_sub,
        status,
        catatan,
        no_barcode,
        lama_pengerjaan,
      } = req.body;

      if (!qty_packing)
        return res.status(400).json({
          statusCode: 400,
          status: false,
          msg: "QTY packing wajib di isi",
        });
      if (!no_packing)
        return res.status(400).json({
          statusCode: 400,
          status: false,
          msg: "No packing wajib di isi",
        });
      if (!catatan)
        return res.status(400).json({
          statusCode: 400,
          status: false,
          msg: "catatan wajib di isi",
        });
      if (!status)
        return res.status(400).json({
          statusCode: 400,
          status: false,
          msg: "Status wajib di isi",
        });

      for (let i = 0; i < inspeksi_final_point.length; i++) {
        if (!inspeksi_final_point[i].hasil)
          return res.status(400).json({
            statusCode: 400,
            status: false,
            msg: "Hasil wajib di isi",
          });

        if (!inspeksi_final_point[i].qty)
          return res.status(400).json({
            statusCode: 400,
            status: false,
            msg: "QTY reject wajib di isi",
          });
      }

      //parse bilanagn qty_packing
      const qtyPacking = parseInt(qty_packing);

      //menghitung akar dari qty_packing
      const qtyQuadrat = Math.sqrt(qtyPacking);
      //membulatkan hasil dari akar
      const qtyQuadratFix = Math.round(qtyQuadrat);
      //penghitungan terakhir rumus
      const JumlahPacking = qtyQuadratFix + 1;

      const totalQtyReject = inspeksi_final_point.reduce((total, item) => {
        return total + parseInt(item.qty);
      }, 0);

      const noDoc = await MasterKodeDoc.findByPk(14);

      await InspeksiFinal.update(
        {
          inspector: req.user.id,
          no_pallet,
          catatan,
          no_barcode,
          no_packing,
          qty_packing: qty_packing,
          jumlah_packing: JumlahPacking,
          status,
          lama_pengerjaan,
          waktu_selesai: new Date(),
          bagian_tiket: "history",
          no_doc: noDoc.kode,
        },
        { where: { id }, transaction: t }
      );

      for (let i = 0; i < inspeksi_final_point.length; i++) {
        await InspeksiFinalPoint.update(
          {
            id_inspeksi_final: id,
            hasil: inspeksi_final_point[i].hasil,
            qty: inspeksi_final_point[i].qty,
          },
          { where: { id: inspeksi_final_point[i].id }, transaction: t }
        );
      }

      for (let i = 0; i < inspeksi_final_sub.length; i++) {
        await InspeksiFinalSub.update(
          {
            id_inspeksi_final: id,
            reject: totalQtyReject,
          },
          { where: { id: inspeksi_final_sub[i].id }, transaction: t }
        );
      }

      //const getInspeksiFinal = await InspeksiFinal.findByPk(id);

      // if (status == "bisa kirim" && getInspeksiFinal.id_jo != null) {
      //   //create ke tabel delivery order
      //   const dataListJoDone =
      //     await ProduksiJoDoneService.getProduksiJoDoneService({
      //       id_jo: getInspeksiFinal.id_jo,
      //       status_proses: "check qc",
      //     });

      //   if (dataListJoDone.success === false) {
      //     await t.rollback();

      //     return res.status(400).json({
      //       succes: false,
      //       status_code: 400,
      //       msg: dataListJoDone.message,
      //     });
      //   }
      //   console.log(1);
      //   const createDeliveryOrder =
      //     await DeliveryOrderService.creteDeliveryOrderService({
      //       id_jo: dataListJoDone.data[0].id_jo,
      //       id_io: dataListJoDone.data[0].id_io,
      //       id_so: dataListJoDone.data[0].id_so,
      //       id_customer: dataListJoDone.data[0].id_customer,
      //       id_produk: dataListJoDone.data[0].id_produk,
      //       transaction: t,
      //     });

      //   if (createDeliveryOrder.success === false) {
      //     await t.rollback();

      //     return res.status(400).json({
      //       succes: false,
      //       status_code: 400,
      //       msg: createDeliveryOrder.message,
      //     });
      //   }
      //   console.log(2);

      //   const doneDeliveryOrder =
      //     await ProduksiJoDoneService.doneProduksiJoDoneService({
      //       id: dataListJoDone.data[0].id,
      //       transaction: t,
      //     });

      //   if (doneDeliveryOrder.success === false) {
      //     await t.rollback();

      //     return res.status(400).json({
      //       succes: false,
      //       status_code: 400,
      //       msg: doneDeliveryOrder.message,
      //     });
      //   }
      // } else if (
      //   status == "tidak bisa di kirim" &&
      //   getInspeksiFinal.id_jo != null
      // ) {
      //   //create ke tabel delivery order
      //   const dataListJoDone =
      //     await ProduksiJoDoneService.getProduksiJoDoneService({
      //       id_jo: getInspeksiFinal.id_jo,
      //       status_proses: "check qc",
      //     });

      //   if (dataListJoDone.success === false) {
      //     await t.rollback();

      //     return res.status(400).json({
      //       succes: false,
      //       status_code: 400,
      //       msg: dataListJoDone.message,
      //     });
      //   }
      //   const rejectProduksiJoDone =
      //     await ProduksiJoDoneService.rejectQcProduksiJoDoneService({
      //       id: dataListJoDone.data[0].id,
      //       transaction: t,
      //     });

      //   if (rejectProduksiJoDone.success === false) {
      //     await t.rollback();

      //     return res.status(400).json({
      //       succes: false,
      //       status_code: 400,
      //       msg: rejectProduksiJoDone.message,
      //     });
      //   }
      // }

      await t.commit();

      res.status(200).json({ msg: "Update Successful" });
    } catch (err) {
      await t.rollback();
      console.log(err.message);
      res.status(404).json({ msg: err.message });
    }
  },
};

module.exports = inspeksiFinalController;
