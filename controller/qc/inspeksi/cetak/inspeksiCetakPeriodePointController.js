const { Op, Sequelize, where } = require("sequelize");
const dotenv = require("dotenv");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const MasterKodeMasalahCetak = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCetakModel");
const InspeksiCetakPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectDeparmentMOdel");
const User = require("../../../../model/userModel");
const axios = require("axios");

dotenv.config();

const inspeksiCetakPeriodepointController = {
  startCetakPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiCetakPeriodePoint =
        await InspeksiCetakPeriodePoint.findByPk(_id);
      if (inspeksiCetakPeriodePoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiCetakPeriodePoint.update(
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

  stopCetakPeriodePoint: async (req, res) => {
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
        await InspeksiCetakPeriodeDefect.update(
          {
            hasil: data_defect[index].hasil,
            jumlah_defect: data_defect[index].jumlah_defect,
          },
          { where: { id: data_defect[index].id } }
        );
      }
      await InspeksiCetakPeriodePoint.update(
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

  createInspeksiCetakPeriodePoint: async (req, res) => {
    const { id_inspeksi_cetak_periode, masterKodeCetak, masterKodeCetak2 } =
      req.body;
    try {
      // const masterKodeCetak = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=3`
      // );
      // const masterKodeCetak2 = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=4`
      // );
      const cetakPeriode = await InspeksiCetakPeriode.findByPk(
        id_inspeksi_cetak_periode
      );

      const cetakPeriodePoint = await InspeksiCetakPeriodePoint.create({
        id_inspeksi_cetak_periode: id_inspeksi_cetak_periode,
      });

      for (let i = 0; i < masterKodeCetak.data.length; i++) {
        const cetakDefect = await InspeksiCetakPeriodeDefect.create({
          id_inspeksi_cetak_periode_point: cetakPeriodePoint.id,
          id_inspeksi_cetak: cetakPeriode.id_inspeksi_cetak,
          kode: masterKodeCetak.data[i].e_kode_produksi,
          masalah: masterKodeCetak.data[i].nama_kendala,
          kriteria: masterKodeCetak.data[i].criteria,
          persen_kriteria: masterKodeCetak.data[i].criteria_percent,
          sumber_masalah: masterKodeCetak.data[i].kategori_kendala,
        });

        for (
          let ii = 0;
          ii < masterKodeCetak.data[i].target_department.length;
          ii++
        ) {
          const depart = masterKodeCetak.data[i].target_department[ii];
          await InspeksiCetakPeriodeDefectDepartment.create({
            id_inspeksi_cetak_periode_point_defect: cetakDefect.id,
            id_department: parseInt(depart.id_department),
            nama_department: depart.nama_department,
          });
        }
      }

      // for (let i = 0; i < masterKodeCetak2.data.length; i++) {
      //   const cetakDefect = await InspeksiCetakPeriodeDefect.create({
      //     id_inspeksi_cetak_periode_point: cetakPeriodePoint.id,
      //     id_inspeksi_cetak: cetakPeriode.id_inspeksi_cetak,
      //     kode: masterKodeCetak2.data[i].e_kode_produksi,
      //     masalah: masterKodeCetak2.data[i].nama_kendala,
      //     kriteria: masterKodeCetak2.data[i].criteria,
      //     persen_kriteria: masterKodeCetak2.data[i].criteria_percent,
      //     sumber_masalah: masterKodeCetak2.data[i].kategori_kendala,
      //   });

      //   for (
      //     let ii = 0;
      //     ii < masterKodeCetak2.data[i].target_department.length;
      //     ii++
      //   ) {
      //     const depart = masterKodeCetak2.data[i].target_department[ii];
      //     await InspeksiCetakPeriodeDefectDepartment.create({
      //       id_inspeksi_cetak_periode_point_defect: cetakDefect.id,
      //       id_department: parseInt(depart.id_department),
      //       nama_department: depart.nama_department,
      //     });
      //   }
      // }

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakPeriodepointController;
