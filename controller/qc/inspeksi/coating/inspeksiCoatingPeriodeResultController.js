const dotenv = require("dotenv");
const InspeksiCoatingResultPointPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingPointMasterPeriode = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");
const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingPeriodeDefectDeparmentMOdel");
const axios = require("axios");

dotenv.config();
const inspeksiCoatingPeriodeResultController = {
  startCoatingPeriodeResult: async (req, res) => {
    try {
      const { id } = req.params;
      const timenow = new Date();
      await InspeksiCoatingResultPeriode.update(
        { waktu_mulai: timenow, status: "on progress", inspector: req.user.id },
        { where: { id } }
      );

      res.status(200).json({ data: "start successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  stopCoatingPeriodeResult: async (req, res) => {
    try {
      const { id } = req.params;

      const newdate = new Date();

      const {
        lama_pengerjaan,
        foto,
        waktu_sampling,
        inspector,
        numerator,
        nilai_glossy_kiri,
        nilai_glossy_tengah,
        nilai_glossy_kanan,
        jumlah_sampling,
        kode_masalah,
      } = req.body;

      let counter = 0;
      for (let i = 0; i < kode_masalah.length; i++) {
        kode_masalah[i].id_inspeksi_coating_result_periode = id;
        counter++;
        await InspeksiCoatingResultPointPeriode.update(
          {
            hasil: kode_masalah[i].hasil,
            jumlah_defect: kode_masalah[i].jumlah_defect,
            masalah: kode_masalah[i].masalah,
            sumber_masalah: kode_masalah[i].sumber_masalah,
            kriteria: kode_masalah[i].kriteria,
            persen_kriteria: kode_masalah[i].persen_kriteria,
            jumlah_up_defect: kode_masalah[i].jumlah_up_defect,
            kode_lkh: kode_masalah[i].kode_lkh,
            masalah_lkh: kode_masalah[i].masalah_lkh,
            file: kode_masalah[i].file,
          },
          { where: { id: kode_masalah[i].id } }
        );
      }

      await InspeksiCoatingResultPeriode.update(
        {
          waktu_selesai: newdate,
          lama_pengerjaan,
          foto,
          waktu_sampling,
          inspector,
          numerator,
          nilai_glossy_kiri,
          nilai_glossy_tengah,
          nilai_glossy_kanan,
          jumlah_sampling,
          status: "done",
        },
        { where: { id } }
      );

      res.status(200).json({ data: "stop successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  addInspeksiCoatingPeriodeResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { masterMasalah } = req.body;

      // const masterMasalah = await axios.get(
      //   `${process.env.LINK_P1}/api/list-kendala?criteria=true&proses=5`
      // );
      const resultPeriode = await InspeksiCoatingResultPeriode.create({
        id_inspeksi_coating: id,
      });

      for (let i = 0; i < masterMasalah.data.length; i++) {
        const coatingDefect = await InspeksiCoatingResultPointPeriode.create({
          id_inspeksi_coating_result_periode: resultPeriode.id,
          id_inspeksi_coating: id,
          kode: masterMasalah.data[i].e_kode_produksi,
          masalah: masterMasalah.data[i].nama_kendala,
          kriteria: masterMasalah.data[i].criteria,
          persen_kriteria: masterMasalah.data[i].criteria_percent,
          sumber_masalah: masterMasalah.data[i].kategori_kendala,
        });

        for (
          let ii = 0;
          ii < masterMasalah.data[i].target_department.length;
          ii++
        ) {
          const depart = masterMasalah.data[i].target_department[ii];
          await InspeksiCoatingPeriodeDefectDepartment.create({
            id_inspeksi_coating_periode_point_defect: coatingDefect.id,
            id_department: parseInt(depart.id_department),
            nama_department: depart.nama_department,
          });
        }
      }

      res.status(200).json({ data: "create data successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  addInspeksiCoatingPeriodePoint: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        kode,
        masalah,
        sumber_masalah,
        kriteria,
        persen_kriteria,
        department,
      } = req.body;
      const data = await InspeksiCoatingResultPeriode.findByPk(id);
      const coatingDefect = await InspeksiCoatingResultPointPeriode.create({
        id_inspeksi_coating_result_periode: id,
        id_inspeksi_coating: data.id_inspeksi_coating,
        kode,
        masalah,
        sumber_masalah,
        kriteria,
        persen_kriteria,
      });

      for (let index = 0; index < department.length; index++) {
        await InspeksiCoatingPeriodeDefectDepartment.create({
          id_inspeksi_coating_periode_point_defect: coatingDefect.id,
          id_department: department[index].id,
          nama_department: department[index].department,
        });
      }

      res.status(200).json({ data: "create data successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  deleteCoatingPeriodeResult: async (req, res) => {
    try {
      const { id } = req.params;
      await InspeksiCoatingResultPeriode.destroy({ where: { id: id } });

      res.status(200).json({ data: "Delete successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
module.exports = inspeksiCoatingPeriodeResultController;
