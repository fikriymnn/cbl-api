const { Op, Sequelize, where } = require("sequelize");

const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const InspeksiPondPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectDepartmentModel");
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
      department,
    } = req.body;
    try {
      const pondDefect = await InspeksiPondPeriodeDefect.create({
        id_inspeksi_pond_periode_point: id_inspeksi_pond_periode_point,
        id_inspeksi_pond: id_inspeksi_pond,
        kode: kode,
        masalah: masalah,
        kriteria: kriteria,
        persen_kriteria: persen_kriteria,
        sumber_masalah: sumber_masalah,
      });

      for (let index = 0; index < department.length; index++) {
        await InspeksiPondPeriodeDefectDepartment.create({
          id_inspeksi_pond_periode_point_defect: pondDefect.id,
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

module.exports = inspeksiPondPeriodeDefectController;
