const InspeksiCoatingResultPointPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingSubAwal = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");

const inspeksiCoatingAwalResultController = {
  addInspeksiCoatingAwalResult: async (req, res) => {
    try {
      const { id } = req.params;
      // const response = await InspeksiCoatingResultAwal.create({
      //   id_inspeksi_coating: id,
      // });

      // ini kode baru karena menyesuaikan dengan FE, karena fe mengirim id coating awal bukan id coating
      const checkData = await InspeksiCoatingSubAwal.findByPk(id);
      await InspeksiCoatingResultAwal.create({
        id_inspeksi_coating: checkData.id_inspeksi_coating,
      });

      res.status(200).json({ data: "create data successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  startCoatingAwalResult: async (req, res) => {
    try {
      const { id } = req.params;
      const timenow = new Date();
      await InspeksiCoatingResultAwal.update(
        {
          waktu_mulai: timenow,
          status: "on progress",
          id_inspector: req.user.id,
        },
        { where: { id } }
      );

      res.status(200).json({ data: "start successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  stopCoatingAwalResult: async (req, res) => {
    try {
      const { id } = req.params;

      const newdate = new Date();

      const {
        lama_pengerjaan,
        catatan,
        foto,
        line_clearance,
        permukaan,
        nilai_glossy,
        gramatur,
        hasil_coating,
        spot_uv,
        tes_cracking,
        file,
      } = req.body;

      await InspeksiCoatingResultAwal.update(
        {
          lama_pengerjaan,
          waktu_selesai: newdate,
          catatan,
          foto,
          line_clearance,
          permukaan,
          nilai_glossy,
          gramatur,
          hasil_coating,
          spot_uv,
          tes_cracking,
          status: "done",
          file,
        },
        { where: { id } }
      );

      res.status(200).json({ data: "stop successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
module.exports = inspeksiCoatingAwalResultController;
