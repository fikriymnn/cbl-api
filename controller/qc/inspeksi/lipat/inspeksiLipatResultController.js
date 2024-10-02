const InspeksiLipatResult = require("../../../../model/qc/inspeksi/lipat/inspeksiLipatResultModel");

const inspeksiLipatResultController = {
  startLipatPoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiLipatPoint = await InspeksiLipatResult.findByPk(_id);
      if (inspeksiLipatPoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiLipatResult.update(
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

  updateInspeksiLipatResult: async (req, res) => {
    try {
      const { id } = req.params;
      const { acuan, hasil_check, keterangan } = req.body;

      let obj = {
        send: true,
      };
      if (hasil_check) obj.hasil_check = hasil_check;
      if (acuan) obj.acuan = acuan;
      if (keterangan) obj.keterangan = keterangan;

      for (let i = 0; i < hasil_check.length; i++) {
        await InspeksiLipatResult.update(
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

module.exports = inspeksiLipatResultController;
