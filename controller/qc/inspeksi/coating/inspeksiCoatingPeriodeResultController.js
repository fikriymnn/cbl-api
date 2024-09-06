const InspeksiCoatingResultPointPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingPointMasterPeriode = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");
const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");

const inspeksiCoatingPeriodeResultController = {
  startCoatingPeriodeResult: async (req, res) => {
    try {
      const { id } = req.params;
      const timenow = new Date();
      await InspeksiCoatingResultPeriode.update(
        { waktu_mulai: timenow, status: "on progress" },
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
            persen_kriteria: kode_masalah[i].persen_kriteria 
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
      const resultPeriode = await InspeksiCoatingResultPeriode.create({
        id_inspeksi_coating: id,
      });
      const masterMasalah = await InspeksiCoatingPointMasterPeriode.findAll();

      for (let i = 0; i < masterMasalah.length; i++) {
        InspeksiCoatingResultPointPeriode.create({
          id_inspeksi_coating_result_periode: resultPeriode.id,
          id_inspeksi_coating: id,
          kode: masterMasalah[i].kode,
          masalah: masterMasalah[i].masalah,
          sumber_masalah: masterMasalah[i].sumber_masalah,
          kriteria:masterMasalah[i].kriteria,
          persen_kriteria:masterMasalah[i].persen_kriteria
        });
      }

      res.status(200).json({ data: "create data successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  addInspeksiCoatingPeriodePoint: async (req, res) => {
    try {
      const { id } = req.params;
      const { kode, masalah,sumber_masalah, kriteria, persen_kriteria } = req.body;
      const data = await InspeksiCoatingResultPeriode.findByPk(id)
      await InspeksiCoatingResultPointPeriode.create({
        id_inspeksi_coating_result_periode: id,
        id_inspeksi_coating: data.id_inspeksi_coating,
        kode,
        masalah,sumber_masalah, kriteria, persen_kriteria
      });

      res.status(200).json({ data: "create data successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
module.exports = inspeksiCoatingPeriodeResultController;
