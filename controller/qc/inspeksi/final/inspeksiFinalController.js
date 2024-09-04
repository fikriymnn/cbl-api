const InspeksiMasterPointFinal = require("../../../../model/masterData/qc/inspeksi/masterPointFinalModel");
const InspeksiMasterSubFinal = require("../../../../model/masterData/qc/inspeksi/masterSubFinalModel");
const InspeksiFinal = require("../../../../model/qc/inspeksi/final/inspeksiFinalModel");
const InspeksiFinalPoint = require("../../../../model/qc/inspeksi/final/inspeksiFinalPoint");
const InspeksiFinalSub = require("../../../../model/qc/inspeksi/final/inspeksiFinalSubModel");

const inspeksiFinalController = {
  getInspeksiFinal: async (req, res) => {
    try {
      const { status, page, limit } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (page && limit && status) {
        if (status) obj.status = status;

        const length = await InspeksiFinal.count({ where: obj });
        const data = await InspeksiFinal.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            { model: InspeksiFinalSub, as: "id_inspeksi_sub" },
            { model: InspeksiFinalPoint, as: "id_inspeksi_point" },
          ],
        });

        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await InspeksiFinal.findAll({
          order: [["createdAt", "DESC"]],
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiFinal.count();
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status) {
        if (status) obj.status = status;
        if (tgl) obj.tanggal = tgl;

        const data = await InspeksiFinal.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        const length = await InspeksiFinal.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data1 = await InspeksiFinal.findByPk(id);

        if (!data1.inspector) {
          await InspeksiFinal.update(
            { inspector: req.user.id },
            { where: { id: id } }
          );
        }

        const data = await InspeksiFinal.findByPk(id, {
          include: [
            { model: InspeksiFinalSub, as: "inspeksi_final_sub" },
            { model: InspeksiFinalPoint, as: "inspeksi_final_point" },
          ],
        });
        return res.status(200).json({ data });
      } else {
        const data = await InspeksiFinal.findAll({
          order: [["createdAt", "DESC"]],
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
      const data = await InspeksiFinal.create({
        tanggal,
        no_jo,
        no_io,
        quantity,
        jam,
        nama_produk,
        customer,
      });

      const masterSubFinal = await InspeksiMasterSubFinal.findAll();
      const masterPointFinal = await InspeksiMasterPointFinal.findAll({
        where: { status: "active" },
      });

      for (let i = 0; i < masterSubFinal.length; i++) {
        console.log(1);
        await InspeksiFinalSub.create({
          id_inspeksi_final: data.id,
          quantity: masterSubFinal[i].quantity,
          jumlah: masterSubFinal[i].jumlah,
          kualitas_lulus: masterSubFinal[i].kualitas_lulus,
          kualitas_tolak: masterSubFinal[i].kualitas_tolak,
        });
      }
      for (let i = 0; i < masterPointFinal.length; i++) {
        console.log(1);
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
  updateInspeksiFinal: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        no_pallet,
        no_packing,
        jumlah_packing,
        inspeksi_final_point,
        inspeksi_final_sub,
      } = req.body;

      await InspeksiFinal.update(
        { no_pallet, no_packing, jumlah_packing, status: "history" },
        { where: { id } }
      );

      for (let i = 0; i < inspeksi_final_point.length; i++) {
        InspeksiFinalPoint.update(
          {
            id_inspeksi_final: id,
            hasil: inspeksi_final_point[i].hasil,
            qty: inspeksi_final_point[i].qty,
          },
          { where: { id: inspeksi_final_point[i].id } }
        );
      }

      for (let i = 0; i < inspeksi_final_sub.length; i++) {
        InspeksiFinalSub.update(
          {
            id_inspeksi_final: id,
            reject: inspeksi_final_sub[i].reject,
          },
          { where: { id: inspeksi_final_sub[i].id } }
        );
      }

      res.status(200).json({ msg: "Update Successful" });
    } catch (err) {
      res.status(404).json({ msg: err.message });
    }
  },
};

module.exports = inspeksiFinalController;
