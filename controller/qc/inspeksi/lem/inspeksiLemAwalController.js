const { Op, Sequelize, where } = require("sequelize");
const dotenv = require("dotenv");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemAwal = require("../../../../model/qc/inspeksi/lem/inspeksiLemAwalModel");
const InspeksiLemAwalPoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemAwalPointModel");
const User = require("../../../../model/userModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const MasterKodeMasalahLem = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahLemModel");
const InspeksiLemPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectDepartmentModel");
const axios = require("axios");

dotenv.config();

const inspeksiLemAwalController = {
  doneLemAwal: async (req, res) => {
    const _id = req.params.id;
    const { jenis_lem, masterKodeLem } = req.body;

    if (!jenis_lem)
      return res.status(400).json({ msg: "jenis lem wajib di isi" });

    try {
      // const masterKodeLem = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=11`
      // );
      const inspeksiLemAwalPoint = await InspeksiLemAwalPoint.findAll({
        where: { id_inspeksi_lem_awal: _id },
      });
      const jumlahPeriode = inspeksiLemAwalPoint.length;
      let totalWaktuCheck = inspeksiLemAwalPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiLemAwal.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
        },
        { where: { id: _id } }
      );
      const lemAwal = await InspeksiLemAwal.findByPk(_id);
      await InspeksiLem.update(
        { status: "incoming" },
        { where: { id: lemAwal.id_inspeksi_lem } }
      );
      await InspeksiLem.update(
        {
          jenis_lem: jenis_lem,
        },
        {
          where: {
            id: lemAwal.id_inspeksi_lem,
          },
        }
      );

      const lemPeriode = await InspeksiLemPeriode.create({
        id_inspeksi_lem: lemAwal.id_inspeksi_lem,
      });
      const lemPeriodePoint = await InspeksiLemPeriodePoint.create({
        id_inspeksi_lem_periode: lemPeriode.id,
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

        //untuk department ketika sudah ada data di p1
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
      }

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingLemAwal: async (req, res) => {
    const _id = req.params.id;
    const { alasan_pending } = req.body;
    try {
      const lemAwal = await InspeksiLemAwal.findByPk(_id);
      // await InspeksiLemAwal.update(
      //   { status: "pending" },
      //   {
      //     where: { id: _id },
      //   }
      // );

      const inspeksiLem = await InspeksiLem.findByPk(lemAwal.id_inspeksi_lem);
      await InspeksiLem.update(
        {
          status: "pending",
          jumlah_pending: inspeksiLem.jumlah_pending + 1,
          alasan_pending: alasan_pending,
        },
        {
          where: { id: lemAwal.id_inspeksi_lem },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemAwalController;
