const { Op, Sequelize, where } = require("sequelize");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondAwal = require("../../../../model/qc/inspeksi/pond/inspeksiPondAwalModel");
const InspeksiPondAwalPoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondAwalPointModel");
const User = require("../../../../model/userModel");

const inspeksiPondAwalpointController = {
  startPondAwalPoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiPondAwalPoint = await InspeksiPondAwalPoint.findByPk(_id);
      if (inspeksiPondAwalPoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiPondAwalPoint.update(
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

  stopPondAwalPoint: async (req, res) => {
    const _id = req.params.id;
    const {
      catatan,
      lama_pengerjaan,
      line_clearance,
      register,
      ketajaman,
      ukuran,
      bentuk_jadi,
      riil,
      reforasi,
      file,
    } = req.body;

    if (
      !lama_pengerjaan ||
      !line_clearance ||
      !register ||
      !ketajaman ||
      !ukuran ||
      !bentuk_jadi ||
      !riil ||
      !reforasi
    )
      return res.status(400).json({ msg: "Incomplite Data" });

    try {
      await InspeksiPondAwalPoint.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          catatan,
          lama_pengerjaan,
          line_clearance,
          register,
          ketajaman,
          ukuran,
          bentuk_jadi,
          riil,
          reforasi,
          file,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Stop Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  createInspeksiPondAwalPoint: async (req, res) => {
    const { id_inspeksi_pond_awal } = req.body;
    try {
      const inspeksiPondAwalPoint = await InspeksiPondAwalPoint.create({
        id_inspeksi_pond_awal: id_inspeksi_pond_awal,
      });
      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiPondAwalpointController;
