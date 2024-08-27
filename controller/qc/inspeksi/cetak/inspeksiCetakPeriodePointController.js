const { Op, Sequelize, where } = require("sequelize");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const MasterKodeMasalahCetak = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCetakModel");
const User = require("../../../../model/userModel");

const inspeksiCetakPeriodepointController = {
  startCetakPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiCetakPeriodePoint =
        await InspeksiCetakPeriodePoint.findByPk(_id);
      if (inspeksiCetakPeriodePoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiCetakPeriodePoint.update(
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

  stopCetakPeriodePoint: async (req, res) => {
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
        await InspeksiCetakPeriodeDefect.update(
          {
            hasil: data_defect[index].hasil,
            jumlah_defect: data_defect[index].jumlah_defect,
          },
          { where: { id: data_defect[index].id } }
        );
      }
      await InspeksiCetakPeriodePoint.update(
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

  createInspeksiCetakPeriodePoint: async (req, res) => {
    const { id_inspeksi_cetak_periode } = req.body;
    try {
      const masterKodeCetak = await MasterKodeMasalahCetak.findAll({
        where: { status: "active" },
      });
      const cetakPeriode = await InspeksiCetakPeriode.findByPk(
        id_inspeksi_cetak_periode
      );

      const cetakPeriodePoint = await InspeksiCetakPeriodePoint.create({
        id_inspeksi_cetak_periode: id_inspeksi_cetak_periode,
      });
      console.log(masterKodeCetak);

      for (let i = 0; i < masterKodeCetak.length; i++) {
        await InspeksiCetakPeriodeDefect.create({
          id_inspeksi_cetak_periode_point: cetakPeriodePoint.id,
          id_inspeksi_cetak: cetakPeriode.id_inspeksi_cetak,
          kode: masterKodeCetak[i].kode,
          masalah: masterKodeCetak[i].masalah,
          kriteria: masterKodeCetak[i].kriteria,
          persen_kriteria: masterKodeCetak[i].persen_kriteria,
          sumber_masalah: masterKodeCetak[i].sumber_masalah,
        });
      }

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakPeriodepointController;
