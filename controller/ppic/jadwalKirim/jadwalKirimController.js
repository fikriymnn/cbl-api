const TiketJadwalProduksi = require("../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiModel");

const { Op, Sequelize, where } = require("sequelize");
const db = require("../../../config/database");

const JadwalKirimController = {
  getJadwalKirim: async (req, res) => {
    const { tgl } = req.query;
    try {
      let tglKirim = tgl;
      if (!tgl) {
        const dateNow = new Date();
        const year = dateNow.getFullYear();
        const month = dateNow.getMonth() + 1;
        const day = dateNow.getDate() + 1;
        tglKirim = `${year}-${month}-${day}`;
      }
      // Awal bulan
      const startDate = new Date(tglKirim);
      startDate.setHours(0, 0, 0, 0);

      const dataJadwal = await TiketJadwalProduksi.findAll({
        where: {
          tgl_kirim_update_date: { [Op.gte]: startDate },
        },
      });

      // 1. Kelompokkan berdasarkan tgl_kirim_update_date yang diformat
      const grouped = dataJadwal.reduce((acc, item) => {
        const key = formatTanggal(item.tgl_kirim_update_date); // jadi "25 August 2025"
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      // 2. Urutkan setiap grup berdasarkan tgl_so_date (paling lama di atas)
      for (const key in grouped) {
        grouped[key].sort(
          (a, b) => new Date(a.tgl_so_date) - new Date(b.tgl_so_date)
        );
      }

      // 3. Ubah hasil jadi array terstruktur
      const resultJadwalKirim = Object.entries(grouped).map(
        ([tgl_kirim, items]) => ({
          tgl_kirim, // sudah dalam format "25 August 2025"
          data: items,
        })
      );

      return res.status(200).json({
        //data: dataBooking,
        data: resultJadwalKirim,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

// Helper untuk format tanggal menjadi "25 August 2025"
function formatTanggal(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

module.exports = JadwalKirimController;
