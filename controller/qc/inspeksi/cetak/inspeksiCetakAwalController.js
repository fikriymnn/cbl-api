const { Op, Sequelize, where } = require("sequelize");
const dotenv = require("dotenv");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const User = require("../../../../model/userModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const MasterKodeMasalahCetak = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCetakModel");
const InspeksiCetakPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectDeparmentMOdel");
const axios = require("axios");

dotenv.config();

const inspeksiCetakAwalController = {
  doneCetakAwal: async (req, res) => {
    const _id = req.params.id;
    const { masterKodeCetak, sample_1, sample_2, sample_3 } = req.body;

    try {
      // const masterKodeCetak = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=3`
      // );
      // const masterKodeCetak2 = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=4`
      // );
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
          sample_1,
          sample_2,
          sample_3,
          hasil_sample_1: (sample_1 / 100) * 10000,
          hasil_sample_2: (sample_2 / 100) * 10000,
          hasil_sample_3: (sample_3 / 100) * 10000,
        },
        { where: { id: _id } }
      );
      const cetakAwal = await InspeksiCetakAwal.findByPk(_id);
      await InspeksiCetak.update(
        { status: "incoming" },
        { where: { id: cetakAwal.id_inspeksi_cetak } }
      );

      const cetakPeriode = await InspeksiCetakPeriode.create({
        id_inspeksi_cetak: cetakAwal.id_inspeksi_cetak,
      });
      const cetakPeriodePoint = await InspeksiCetakPeriodePoint.create({
        id_inspeksi_cetak_periode: cetakPeriode.id,
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

        //untuk department ketika sudah ada data di p1
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

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingCetakAwal: async (req, res) => {
    const _id = req.params.id;
    const { alasan_pending } = req.body;
    try {
      const cetakAwal = await InspeksiCetakAwal.findByPk(_id);
      // await InspeksiCetakAwal.update(
      //   { status: "pending" },
      //   {
      //     where: { id: _id },
      //   }
      // );
      const inspeksiCetak = await InspeksiCetak.findByPk(
        cetakAwal.id_inspeksi_cetak
      );

      await InspeksiCetak.update(
        {
          status: "pending",
          jumlah_pending: inspeksiCetak.jumlah_pending + 1,
          alasan_pending: alasan_pending,
        },
        {
          where: { id: cetakAwal.id_inspeksi_cetak },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakAwalController;
