const { Op, Sequelize, where } = require("sequelize");

const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const User = require("../../../../model/userModel");

const inspeksiPondPeriodeDefectController = {
  addInspeksiPondDefect: async (req, res) => {
    const {
      id_inspeksi_pond_periode_point,
      id_inspeksi_pond,
      kode,
      masalah,
      kriteria,
      persen_kriteria,
      sumber_masalah,
    } = req.body;
    try {
      await InspeksiPondPeriodeDefect.create({
        id_inspeksi_pond_periode_point: id_inspeksi_pond_periode_point,
        id_inspeksi_pond: id_inspeksi_pond,
        kode: kode,
        masalah: masalah,
        kriteria: kriteria,
        persen_kriteria: persen_kriteria,
        sumber_masalah: sumber_masalah,
      });

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiPondPeriodeDefectController;
