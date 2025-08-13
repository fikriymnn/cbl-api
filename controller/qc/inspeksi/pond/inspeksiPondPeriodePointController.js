const { Op, Sequelize, where } = require("sequelize");
const dotenv = require("dotenv");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const MasterKodeMasalahpond = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahPondModel");
const InspeksiPondPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectDepartmentModel");
const User = require("../../../../model/userModel");
const axios = require("axios");

dotenv.config();

const inspeksiPondPeriodepointController = {
  startPondPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiPondPeriodePoint = await InspeksiPondPeriodePoint.findByPk(
        _id
      );
      if (inspeksiPondPeriodePoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiPondPeriodePoint.update(
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

  stopPondPeriodePoint: async (req, res) => {
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
        await InspeksiPondPeriodeDefect.update(
          {
            hasil: data_defect[index].hasil,
            jumlah_defect: data_defect[index].jumlah_defect,
            jumlah_up_defect: data_defect[index].jumlah_up_defect,
            kode_lkh: data_defect[index].kode_lkh,
            masalah_lkh: data_defect[index].masalah_lkh,
            file: data_defect[index].file,
          },
          { where: { id: data_defect[index].id } }
        );
      }
      await InspeksiPondPeriodePoint.update(
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

  createInspeksiPondPeriodePoint: async (req, res) => {
    const { id_inspeksi_pond_periode, masterKodePond } = req.body;
    try {
      // const masterKodePond = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=7`
      // );

      const pondPeriode = await InspeksiPondPeriode.findByPk(
        id_inspeksi_pond_periode
      );

      const pondPeriodePoint = await InspeksiPondPeriodePoint.create({
        id_inspeksi_pond_periode: id_inspeksi_pond_periode,
      });

      for (let i = 0; i < masterKodePond.data.length; i++) {
        const pondDefect = await InspeksiPondPeriodeDefect.create({
          id_inspeksi_pond_periode_point: pondPeriodePoint.id,
          id_inspeksi_pond: pondPeriode.id_inspeksi_pond,
          kode: masterKodePond.data[i].e_kode_produksi,
          masalah: masterKodePond.data[i].nama_kendala,
          kriteria: masterKodePond.data[i].criteria,
          persen_kriteria: masterKodePond.data[i].criteria_percent,
          sumber_masalah: masterKodePond.data[i].kategori_kendala,
        });

        for (
          let ii = 0;
          ii < masterKodePond.data[i].target_department.length;
          ii++
        ) {
          const depart = masterKodePond.data[i].target_department[ii];
          await InspeksiPondPeriodeDefectDepartment.create({
            id_inspeksi_pond_periode_point_defect: pondDefect.id,
            id_department: parseInt(depart.id_department),
            nama_department: depart.nama_department,
          });
        }

        // for (let ii = 0; ii < masterKodeCetak[i].department.length; ii++) {
        //   const depart = masterKodeCetak[i].department[ii];
        //   await InspeksiCetakPeriodeDefectDepartment.create({
        //     id_inspeksi_cetak_periode_point_defect: cetakPeriodeDefect.id,
        //     id_department: depart.id,
        //     nama_department: depart.name,
        //   });
        // }
      }

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  deletePondPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiPondPeriodePoint.destroy({ where: { id: _id } });
      res.status(200).json({ msg: "Delete Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiPondPeriodepointController;
