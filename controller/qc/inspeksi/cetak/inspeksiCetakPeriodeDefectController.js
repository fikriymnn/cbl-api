const { Op, Sequelize, where } = require("sequelize");

const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const User = require("../../../../model/userModel");

const inspeksiCetakPeriodeDefectController = {
  addInspeksiCetakDefect: async (req, res) => {
    const { id_inspeksi_cetak_periode_point, kode, masalah } = req.body;
    try {
      await InspeksiCetakPeriodeDefect.create({
        id_inspeksi_cetak_periode_point: id_inspeksi_cetak_periode_point,
        kode: kode,
        masalah: masalah,
      });

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakPeriodeDefectController;