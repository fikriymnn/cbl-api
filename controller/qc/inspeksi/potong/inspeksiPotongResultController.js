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

      for (let i = 0; i < hasil_check.length; i++) {
        await InspeksiPotongResult.update(
          {
            hasil_check: hasil_check[i].hasil_check,
            keterangan: hasil_check[i].keterangan,
            send: true,
          },
          {
            where: { id: hasil_check[i].id },
          }
        );
      }

      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = inspeksiPotongResultController;
