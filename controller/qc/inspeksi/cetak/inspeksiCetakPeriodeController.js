const { Op, Sequelize, where } = require("sequelize");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");

const inspeksiCetakPeriodeController = {
  doneCetakPeriode: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;

    try {
      const inspeksiCetakPeriodePoint = await InspeksiCetakPeriodePoint.findAll(
        {
          where: { id_inspeksi_cetak_periode: _id },
        }
      );
      const jumlahPeriode = inspeksiCetakPeriodePoint.length;
      let totalWaktuCheck = inspeksiCetakPeriodePoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiCetakPeriode.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
          catatan: catatan,
        },
        { where: { id: _id } }
      );
      const cetakPeriode = await InspeksiCetakPeriode.findByPk(_id);

      await InspeksiCetak.update(
        { status: "history" },
        { where: { id: cetakPeriode.id_inspeksi_cetak } }
      );

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingCetakPeriode: async (req, res) => {
    const _id = req.params.id;
    try {
      const cetakPeriode = await InspeksiCetakPeriode.findByPk(_id);
      await InspeksiCetakPeriode.update(
        { status: "pending" },
        {
          where: { id: _id },
        }
      );
      await InspeksiCetak.update(
        { status: "pending" },
        {
          where: { id: cetakPeriode.id_inspeksi_cetak },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakPeriodeController;
