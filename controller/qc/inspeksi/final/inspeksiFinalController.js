const InspeksiMasterPointFinal = require("../../../../model/masterData/qc/inspeksi/masterPointFinalModel");
const InspeksiMasterSubFinal = require("../../../../model/masterData/qc/inspeksi/masterSubFinalModel");
const InspeksiFinal = require("../../../../model/qc/inspeksi/final/inspeksiFinalModel");
const InspeksiFinalPoint = require("../../../../model/qc/inspeksi/final/inspeksiFinalPoint");
const InspeksiFinalSub = require("../../../../model/qc/inspeksi/final/inspeksiFinalSubModel");
const User = require("../../../../model/userModel");
const { Op } = require("sequelize");

const axios = require("axios");
const dotenv = require("dotenv");

const inspeksiFinalController = {
  getInspeksiFinal: async (req, res) => {
    try {
      const { status, bagian_tiket, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && (status || bagian_tiket)) {
        if (status) obj.status = status;
        if (bagian_tiket) obj.bagian_tiket = bagian_tiket;

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
      } else if (page && limit) {
        const data = await InspeksiFinal.findAll({
          order: [["createdAt", "DESC"]],
          include: [{ model: User, as: "data_inspector" }],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiFinal.count();
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || bagian_tiket) {
        if (status) obj.status = status;
        if (bagian_tiket) obj.bagian_tiket = bagian_tiket;

        const data = await InspeksiFinal.findAll({
          order: [["createdAt", "DESC"]],
          include: [{ model: User, as: "data_inspector" }],
          where: obj,
        });
        const length = await InspeksiFinal.count({ where: obj });
        return res.status(200).json({
          data,
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
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createInspeksiFinal: async (req, res) => {
    const { tanggal, no_jo, no_io, quantity, jam, nama_produk, customer } =
      req.body;
    try {
      const qtyFinal = parseInt(quantity);
      const data = await InspeksiFinal.create({
        tanggal,
        no_jo,
        no_io,
        quantity,
        jam,
        nama_produk,
        customer,
      });

      const masterSubFinal = await InspeksiMasterSubFinal.findOne({
        where: {
          [Op.and]: [
            { quantity_awal: { [Op.lte]: qtyFinal } },
            { quantity_akhir: { [Op.gte]: qtyFinal } },
          ],
        },
      });
      const masterPointFinal = await InspeksiMasterPointFinal.findAll({
        where: { status: "active" },
      });
      if (masterSubFinal) {
        await InspeksiFinalSub.create({
          id_inspeksi_final: data.id,
          quantity_awal: masterSubFinal.quantity_awal,
          quantity_akhir: masterSubFinal.quantity_akhir,
          jumlah: masterSubFinal.jumlah,
          kualitas_lulus: masterSubFinal.kualitas_lulus,
          kualitas_tolak: masterSubFinal.kualitas_tolak,
        });
      }

      for (let i = 0; i < masterPointFinal.length; i++) {
        await InspeksiFinalPoint.create({
          id_inspeksi_final: data.id,
          point: masterPointFinal[i].point,
          standar: masterPointFinal[i].standar,
          cara_periksa: masterPointFinal[i].cara_periksa,
        });
      }

      res.status(200).json({ msg: "create Successful" });
    } catch (error) {
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
      //parse bilanagn qty_packing
      const qtyPacking = parseInt(qty_packing);
      //menghitung akar dari qty_packing
      const qtyQuadrat = Math.sqrt(qtyPacking);
      //membulatkan hasil dari akar
      const qtyQuadratFix = Math.round(qtyQuadrat);
      //penghitungan terakhir rumus
      const JumlahPacking = qtyQuadratFix + 1;

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

      const totalQtyReject = inspeksi_final_point.reduce((total, item) => {
        return total + parseInt(item.qty);
      }, 0);

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
        },
        { where: { id } }
      );

      for (let i = 0; i < inspeksi_final_point.length; i++) {
        await InspeksiFinalPoint.update(
          {
            id_inspeksi_final: id,
            hasil: inspeksi_final_point[i].hasil,
            qty: inspeksi_final_point[i].qty,
          },
          { where: { id: inspeksi_final_point[i].id } }
        );
      }

      for (let i = 0; i < inspeksi_final_sub.length; i++) {
        await InspeksiFinalSub.update(
          {
            id_inspeksi_final: id,
            reject: totalQtyReject,
          },
          { where: { id: inspeksi_final_sub[i].id } }
        );
      }
      // console.log(req.body);

      // const inspeksi = await InspeksiFinal.findByPk(id);
      // if (status == "bisa kirim") {
      //   const request = await axios.post(
      //     `${process.env.LINK_P1}/api/approve-final-inspection?no_jo=${inspeksi.no_jo}`,
      //     {}
      //   );
      //   console.log(request);
      // }

      res.status(200).json({ msg: "Update Successful" });
    } catch (err) {
      res.status(404).json({ msg: err.message });
    }
  },
};

module.exports = inspeksiFinalController;
