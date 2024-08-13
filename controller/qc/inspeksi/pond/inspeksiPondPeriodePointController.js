const { Op, Sequelize, where } = require("sequelize");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const MasterKodeMasalahpond = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahPondModel");
const User = require("../../../../model/userModel");

const inspeksiPondPeriodepointController = {
  startPondPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiPondPeriodePoint = await InspeksiPondPeriodePoint.findByPk(
        _id
      );
      if (inspeksiPondPeriodePoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiPondPeriodePoint.update(
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

  stopPondPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    const {
      catatan,
      lama_pengerjaan,
      numerator,
      jumlah_sampling,
      data_defect,
    } = req.body;
    if (
      !lama_pengerjaan ||
      !numerator ||
      !jumlah_sampling ||
      !data_defect ||
      data_defect.length == 0
    )
      return res.status(400).json({ msg: "Incomplite Data" });
    try {
      for (let i = 0; i < data_defect.length; i++) {
        if (data_defect[i].hasil == null)
          return res.status(400).json({
            msg: `data defect dengan kode ${data_defect[i].kode} wajib di isi`,
          });
      }

      for (let index = 0; index < data_defect.length; index++) {
        await InspeksiPondPeriodeDefect.update(
          { hasil: data_defect[index].hasil },
          { where: { id: data_defect[index].id } }
        );
      }
      await InspeksiPondPeriodePoint.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          lama_pengerjaan,
          catatan,
          numerator,
          jumlah_sampling,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Stop Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  createInspeksiPondPeriodePoint: async (req, res) => {
    const { id_inspeksi_pond_periode } = req.body;
    try {
      const masterKodepond = await MasterKodeMasalahpond.findAll();

      const pondPeriodePoint = await InspeksiPondPeriodePoint.create({
        id_inspeksi_pond_periode: id_inspeksi_pond_periode,
      });
      for (let i = 0; i < masterKodepond.length; i++) {
        await InspeksiPondPeriodeDefect.create({
          id_inspeksi_pond_periode_point: pondPeriodePoint.id,
          kode: masterKodepond[i].kode,
          masalah: masterKodepond[i].masalah,
        });
      }
      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiPondPeriodepointController;
