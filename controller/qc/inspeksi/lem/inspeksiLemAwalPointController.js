const { Op, Sequelize, where } = require("sequelize");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemAwal = require("../../../../model/qc/inspeksi/lem/inspeksiLemAwalModel");
const InspeksiLemAwalPoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemAwalPointModel");
const User = require("../../../../model/userModel");

const inspeksiLemAwalpointController = {
  startLemAwalPoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiLemAwalPoint = await InspeksiLemAwalPoint.findByPk(_id);
      if (inspeksiLemAwalPoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiLemAwalPoint.update(
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

  stopLemAwalPoint: async (req, res) => {
    const _id = req.params.id;
    const {
      catatan,
      lama_pengerjaan,
      line_clearance,
      posisi_lem,
      daya_rekat,
      posisi_lipatan,
      kuncian_lock_bottom,
      bentuk_jadi,
      kebersihan,
      file,
    } = req.body;

    if (
      !lama_pengerjaan ||
      !line_clearance ||
      !posisi_lem ||
      !daya_rekat ||
      !posisi_lipatan ||
      !kuncian_lock_bottom ||
      !bentuk_jadi ||
      !kebersihan
    )
      return res.status(400).json({ msg: "Incomplite Data" });
    try {
      await InspeksiLemAwalPoint.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          catatan,
          lama_pengerjaan,
          line_clearance,
          posisi_lem,
          daya_rekat,
          posisi_lipatan,
          kuncian_lock_bottom,
          bentuk_jadi,
          kebersihan,
          file,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Stop Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  createInspeksiLemAwalPoint: async (req, res) => {
    const { id_inspeksi_lem_awal } = req.body;
    try {
      const inspeksiLemAwalPoint = await InspeksiLemAwalPoint.create({
        id_inspeksi_lem_awal: id_inspeksi_lem_awal,
      });
      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemAwalpointController;
