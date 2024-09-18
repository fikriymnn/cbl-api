const { Op, Sequelize, where } = require("sequelize");
const dotenv = require("dotenv");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondAwal = require("../../../../model/qc/inspeksi/pond/inspeksiPondAwalModel");
const InspeksiPondAwalPoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondAwalPointModel");
const User = require("../../../../model/userModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const MasterKodeMasalahpond = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahPondModel");
const axios = require("axios");

dotenv.config();

const inspeksiPondAwalController = {
  donePondAwal: async (req, res) => {
    const _id = req.params.id;
    const { masterKodePond } = req.body;
    try {
      // const masterKodePond = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=7`
      // );
      const inspeksiPondAwalPoint = await InspeksiPondAwalPoint.findAll({
        where: { id_inspeksi_pond_awal: _id },
      });
      const jumlahPeriode = inspeksiPondAwalPoint.length;
      let totalWaktuCheck = inspeksiPondAwalPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiPondAwal.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
        },
        { where: { id: _id } }
      );
      const pondAwal = await InspeksiPondAwal.findByPk(_id);
      await InspeksiPond.update(
        { status: "incoming" },
        { where: { id: pondAwal.id_inspeksi_pond } }
      );

      const pondPeriode = await InspeksiPondPeriode.create({
        id_inspeksi_pond: pondAwal.id_inspeksi_pond,
      });
      const pondPeriodePoint = await InspeksiPondPeriodePoint.create({
        id_inspeksi_pond_periode: pondPeriode.id,
      });

      for (let i = 0; i < masterKodePond.data.length; i++) {
        await InspeksiPondPeriodeDefect.create({
          id_inspeksi_pond_periode_point: pondPeriodePoint.id,
          id_inspeksi_pond: pondAwal.id_inspeksi_pond,
          kode: masterKodePond.data[i].e_kode_produksi,
          masalah: masterKodePond.data[i].nama_kendala,
          kriteria: masterKodePond.data[i].criteria,
          persen_kriteria: masterKodePond.data[i].criteria_percent,
          sumber_masalah: masterKodePond.data[i].kategori_kendala,
        });

        //untuk department ketika sudah ada data di p1
        // for (let ii = 0; ii < masterKodeCetak[i].department.length; ii++) {
        //   const depart = masterKodeCetak[i].department[ii];
        //   await InspeksiCetakPeriodeDefectDepartment.create({
        //     id_inspeksi_cetak_periode_point_defect: cetakPeriodeDefect.id,
        //     id_department: depart.id,
        //     nama_department: depart.name,
        //   });
        // }
      }

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  pendingPondAwal: async (req, res) => {
    const _id = req.params.id;
    try {
      const pondAwal = await InspeksiPondAwal.findByPk(_id);
      await InspeksiPondAwal.update(
        { status: "pending" },
        {
          where: { id: _id },
        }
      );
      const inspeksipond = await InspeksiPond.findByPk(
        pondAwal.id_inspeksi_pond
      );
      await InspeksiPond.update(
        { status: "pending", jumlah_pending: inspeksipond.jumlah_pending + 1 },
        {
          where: { id: pondAwal.id_inspeksi_pond },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiPondAwalController;
