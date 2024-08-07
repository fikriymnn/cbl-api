const { Op, Sequelize, where } = require("sequelize");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const User = require("../../../../model/userModel");

const inspeksiCetakAwalController = {
  doneCetakAwal: async (req, res) => {
    const _id = req.params.id;

    try {
      const inspeksiCetakAwalPoint = await InspeksiCetakAwalPoint.findAll({
        where: { id_inspeksi_cetak_awal: _id },
      });
      const jumlahPeriode = inspeksiCetakAwalPoint.length;
      let totalWaktuCheck = inspeksiCetakAwalPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiCetakAwal.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
        },
        { where: { id: _id } }
      );

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakAwalController;
