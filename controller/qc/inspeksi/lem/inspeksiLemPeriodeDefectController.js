const { Op, Sequelize, where } = require("sequelize");

const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const InspeksiLemPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectDepartmentModel");
const User = require("../../../../model/userModel");

const inspeksiLemPeriodeDefectController = {
  addInspeksiLemDefect: async (req, res) => {
    const {
      id_inspeksi_lem_periode_point,
      id_inspeksi_lem,
      kode,
      masalah,
      kriteria,
      persen_kriteria,
      sumber_masalah,
      department,
    } = req.body;
    try {
      const lemDefect = await InspeksiLemPeriodeDefect.create({
        id_inspeksi_lem_periode_point: id_inspeksi_lem_periode_point,
        id_inspeksi_lem: id_inspeksi_lem,
        kode: kode,
        masalah: masalah,
        kriteria: kriteria,
        persen_kriteria: persen_kriteria,
        sumber_masalah: sumber_masalah,
      });

      for (let index = 0; index < department.length; index++) {
        await InspeksiLemPeriodeDefectDepartment.create({
          id_inspeksi_lem_periode_point_defect: lemDefect.id,
          id_department: department[index].id,
          nama_department: department[index].department,
        });
      }

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemPeriodeDefectController;
