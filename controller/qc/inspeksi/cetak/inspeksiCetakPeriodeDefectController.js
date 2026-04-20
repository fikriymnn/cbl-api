const { Op, Sequelize, where } = require("sequelize");
const db = require("../../../../config/database");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const InspeksiCetakPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectDeparmentMOdel");
const User = require("../../../../model/userModel");

const inspeksiCetakPeriodeDefectController = {
  addInspeksiCetakDefect: async (req, res) => {
    const {
      id_inspeksi_cetak_periode_point,
      id_inspeksi_cetak,
      //id_master_defect,
      kode,
      masalah,
      kriteria,
      persen_kriteria,
      sumber_masalah,
      department,
    } = req.body;
    try {
      const cetakDefect = await InspeksiCetakPeriodeDefect.create({
        id_inspeksi_cetak_periode_point: id_inspeksi_cetak_periode_point,
        id_inspeksi_cetak: id_inspeksi_cetak,
        //id_master_defect: id_master_defect,
        kode: kode,
        masalah: masalah,
        kriteria: kriteria,
        persen_kriteria: persen_kriteria,
        sumber_masalah: sumber_masalah,
      });

      for (let index = 0; index < department.length; index++) {
        await InspeksiCetakPeriodeDefectDepartment.create({
          id_inspeksi_cetak_periode_point_defect: cetakDefect.id,
          id_department: department[index].id,
          nama_department: department[index].department,
        });
      }

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  updateInspeksiCetakDefect: async (req, res) => {
    const _id = req.params.id;
    const {
      hasil,
      id_mastter_defect,
      jumlah_defect,
      jumlah_up_defect,
      kode_lkh,
      masalah_lkh,
      file,
    } = req.body;
    const t = await db.transaction();
    try {
      await InspeksiCetakPeriodeDefect.update(
        {
          hasil,
          id_mastter_defect,
          jumlah_defect,
          jumlah_up_defect,
          kode_lkh,
          masalah_lkh,
          file,
        },
        { where: { id: _id }, transaction: t }
      );

      await t.commit();

      res
        .status(200)
        .json({ success: false, status_code: 200, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakPeriodeDefectController;
