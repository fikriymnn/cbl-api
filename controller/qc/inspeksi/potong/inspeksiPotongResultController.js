const InspeksiPotongResult = require("../../../../model/qc/inspeksi/potong/inspeksiPotongResultModel");

const inspeksiPotongResultController = {
  updateInspeksiPotongResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { standar, hasil_check, keterangan } = req.body;

      let obj = {
        send: true,
      };
      if (hasil_check) obj.hasil_check = hasil_check;
      if (standar) obj.standar = standar;
      if (keterangan) obj.keterangan = keterangan;

      await InspeksiPotongResult.update(obj, {
        where: { id: id },
      });
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = inspeksiPotongResultController;
