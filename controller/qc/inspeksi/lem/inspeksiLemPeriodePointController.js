const { Op, Sequelize, where } = require("sequelize");
const dotenv = require("dotenv");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const MasterKodeMasalahLem = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahLemModel");
const InspeksiLemPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectDepartmentModel");
const User = require("../../../../model/userModel");
const axios = require("axios");

dotenv.config();

const inspeksiLemPeriodepointController = {
  startLemPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiLemPeriodePoint = await InspeksiLemPeriodePoint.findByPk(
        _id
      );
      if (inspeksiLemPeriodePoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiLemPeriodePoint.update(
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

  stopLemPeriodePoint: async (req, res) => {
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
        await InspeksiLemPeriodeDefect.update(
          {
            hasil: data_defect[index].hasil,
            jumlah_defect: data_defect[index].jumlah_defect,
          },
          { where: { id: data_defect[index].id } }
        );
      }
      await InspeksiLemPeriodePoint.update(
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

  createInspeksiLemPeriodePoint: async (req, res) => {
    const { id_inspeksi_lem_periode, masterKodeLem } = req.body;
    try {
      // const masterKodeLem = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=11`
      // );

      const lemPeriode = await InspeksiLemPeriode.findByPk(
        id_inspeksi_lem_periode
      );

      const lemPeriodePoint = await InspeksiLemPeriodePoint.create({
        id_inspeksi_lem_periode: id_inspeksi_lem_periode,
      });
      for (let i = 0; i < masterKodeLem.data.length; i++) {
        const lemDefect = await InspeksiLemPeriodeDefect.create({
          id_inspeksi_lem_periode_point: lemPeriodePoint.id,
          id_inspeksi_lem: lemPeriode.id_inspeksi_lem,
          kode: masterKodeLem.data[i].e_kode_produksi,
          masalah: masterKodeLem.data[i].nama_kendala,
          kriteria: masterKodeLem.data[i].criteria,
          persen_kriteria: masterKodeLem.data[i].criteria_percent,
          sumber_masalah: masterKodeLem.data[i].kategori_kendala,
        });

        for (
          let ii = 0;
          ii < masterKodeLem.data[i].target_department.length;
          ii++
        ) {
          const depart = masterKodeLem.data[i].target_department[ii];
          await InspeksiLemPeriodeDefectDepartment.create({
            id_inspeksi_lem_periode_point_defect: lemDefect.id,
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

  deleteLemPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiLemPeriodePoint.destroy({ where: { id: _id } });
      res.status(200).json({ msg: "Delete Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemPeriodepointController;
