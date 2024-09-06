const { Op, Sequelize, where } = require("sequelize");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const User = require("../../../../model/userModel");

const inspeksiCetakAwalpointController = {
  startCetakAwalPoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiCetakAwalPoint = await InspeksiCetakAwalPoint.findByPk(_id);
      if (inspeksiCetakAwalPoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiCetakAwalPoint.update(
        {
          waktu_mulai: new Date(),
          id_inspektor: req.user.id,
          status: "on progress",
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Start Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  stopCetakAwalPoint: async (req, res) => {
    const _id = req.params.id;
    const {
      catatan,
      lama_pengerjaan,
      line_clearance,
      design,
      redaksi,
      barcode,
      jenis_bahan,
      gramatur,
      layout_pisau,
      acc_warna_awal_jalan,
    } = req.body;
    if (
      !catatan ||
      !lama_pengerjaan ||
      !line_clearance ||
      !design ||
      !redaksi ||
      !barcode ||
      !jenis_bahan ||
      !gramatur ||
      !layout_pisau ||
      !acc_warna_awal_jalan
    )
      return res.status(400).json({ msg: "Incomplite Data" });
    try {
      await InspeksiCetakAwalPoint.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          catatan,
          lama_pengerjaan,
          line_clearance,
          design,
          redaksi,
          barcode,
          jenis_bahan,
          gramatur,
          layout_pisau,
          acc_warna_awal_jalan,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Stop Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  createInspeksiCetakAwalPoint: async (req, res) => {
    const { id_inspeksi_cetak_awal } = req.body;
    try {
      const inspeksiCetakAwalPoint = await InspeksiCetakAwalPoint.create({
        id_inspeksi_cetak_awal: id_inspeksi_cetak_awal,
      });
      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakAwalpointController;
