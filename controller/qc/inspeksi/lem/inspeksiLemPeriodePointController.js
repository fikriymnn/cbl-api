const { Op, Sequelize, where } = require("sequelize");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const MasterKodeMasalahLem = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahLemModel");
const User = require("../../../../model/userModel");

const inspeksiLemPeriodepointController = {
  startLemPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiLemPeriodePoint = await InspeksiLemPeriodePoint.findByPk(
        _id
      );
      if (inspeksiLemPeriodePoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiLemPeriodePoint.update(
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

  stopLemPeriodePoint: async (req, res) => {
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
        await InspeksiLemPeriodeDefect.update(
          { hasil: data_defect[index].hasil },
          { where: { id: data_defect[index].id } }
        );
      }
      await InspeksiLemPeriodePoint.update(
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

  createInspeksiLemPeriodePoint: async (req, res) => {
    const { id_inspeksi_lem_periode } = req.body;
    try {
      const masterKodelem = await MasterKodeMasalahLem.findAll();

      const lemPeriodePoint = await InspeksiLemPeriodePoint.create({
        id_inspeksi_lem_periode: id_inspeksi_lem_periode,
      });
      for (let i = 0; i < masterKodelem.length; i++) {
        await InspeksiLemPeriodeDefect.create({
          id_inspeksi_lem_periode_point: lemPeriodePoint.id,
          kode: masterKodelem[i].kode,
          masalah: masterKodelem[i].masalah,
        });
      }
      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemPeriodepointController;
