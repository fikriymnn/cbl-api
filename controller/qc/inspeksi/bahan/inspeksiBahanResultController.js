const InspeksiBahanResult = require("../../../../model/qc/inspeksi/bahan/inspeksiBahanResultModel");

const inspeksiBahanResultController = {
  deleteInspeksiBahanResult: async (req, res) => {
    const id = req.params.id;
    try {
      await InspeksiBahanResult.destroy({ where: { id: id } });
      return res.status(200).json({ data: "delete successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  updateInspeksiBahanResult: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        hasil,
        coating,
        hasil_kiri,
        hasil_tengah,
        hasil_kanan,
        hasil_rata_rata,
        keterangan_hasil,
        hasil_lebar,
        hasil_panjang,
        foto,
      } = req.body;

      let obj = {
        send: true,
      };
      if (hasil) obj.hasil = hasil;
      if (coating) obj.coating = coating;
      if (hasil_kiri) {
        obj.hasil_kiri = hasil_kiri;
        obj.hasil_rumus_kiri = (hasil_kiri / 100) * 10000;
      }
      if (hasil_tengah) {
        obj.hasil_tengah = hasil_tengah;
        obj.hasil_rumus_tengah = (hasil_tengah / 100) * 10000;
      }
      if (hasil_kanan) {
        obj.hasil_kanan = hasil_kanan;
        obj.hasil_rumus_kanan = (hasil_kanan / 100) * 10000;
      }
      if (hasil_rata_rata) {
        const hasil_rata =
          (parseInt(hasil_kiri) +
            parseInt(hasil_tengah) +
            parseInt(hasil_kanan)) /
          3;
        const hasil = hasil_rata.toFixed(2);
        obj.hasil_rata_rata = hasil;
      }
      if (hasil_panjang) obj.hasil_panjang = hasil_panjang;
      if (hasil_lebar) obj.hasil_lebar = hasil_lebar;
      if (keterangan_hasil) obj.keterangan_hasil = keterangan_hasil;
      if (foto) obj.foto = foto;

      await InspeksiBahanResult.update(obj, {
        where: { id: id },
      });
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = inspeksiBahanResultController;
