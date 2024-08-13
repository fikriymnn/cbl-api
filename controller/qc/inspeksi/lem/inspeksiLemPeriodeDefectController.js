const { Op, Sequelize, where } = require("sequelize");

const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const User = require("../../../../model/userModel");

const inspeksiLemPeriodeDefectController = {
  addInspeksiLemDefect: async (req, res) => {
    const { id_inspeksi_lem_periode_point, kode, masalah } = req.body;
    try {
      await InspeksiLemPeriodeDefect.create({
        id_inspeksi_lem_periode_point: id_inspeksi_lem_periode_point,
        kode: kode,
        masalah: masalah,
      });

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemPeriodeDefectController;
