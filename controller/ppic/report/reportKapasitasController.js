const { Op, Sequelize, where } = require("sequelize");
const BookingJadwal = require("../../../model/ppic/bookingJadwal/bookingJadwalModel");
const JadwalProduksi = require("../../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const db = require("../../../config/database");

const ReportKapasitasController = {
  getReportKapasitas: async (req, res) => {
    const { tahun, bulan } = req.query;
    try {
      if (!tahun || !bulan)
        return res.status(200).json({ msg: "tahun dan bulan wajib" });
      // Awal bulan
      const startDate = new Date(tahun, bulan - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      // Tanggal 15 bulan berikutnya
      const endDate = new Date(tahun, bulan, 15); // bulan tetap pakai indeks normal
      endDate.setHours(23, 59, 59, 999); // akhir hari

      const dataBooking = await BookingJadwal.findAll({
        where: {
          tanggal: { [Op.between]: [startDate, endDate] },
          status: "incoming",
        },
      });

      const dataJoTerjadwal = await JadwalProduksi.findAll({
        where: { tanggal: { [Op.between]: [startDate, endDate] } },
      });

      const grouped = dataJoTerjadwal.reduce((acc, item) => {
        if (!acc[item.mesin]) {
          acc[item.mesin] = {
            mesin: item.mesin,
            total_qty_pcs: 0,
            total_qty_druk: 0,
            detail: [],
          };
        }

        acc[item.mesin].total_qty_pcs += item.qty_pcs;
        acc[item.mesin].total_qty_druk += item.qty_druk;
        acc[item.mesin].detail.push(item);

        return acc;
      }, {});

      let sisaKapasitas = [];

      listKapasitasMesin.map((data) => {
        const findDataMesin = Object.values(grouped).find((item) =>
          item.mesin.toLowerCase().includes(data.mesin.toLowerCase())
        );

        if (findDataMesin) {
          if (data.proses == "lipat" || data.proses == "lem") {
            sisaKapasitas.push({
              mesin: data.mesin,
              kapasitas_mesin: data.kapasitas,
              total_kapasitas: findDataMesin.total_qty_pcs,
              sisa_kapasitas_percent: parseInt(
                (
                  ((data.kapasitas - findDataMesin.total_qty_pcs) /
                    data.kapasitas) *
                  100
                ).toFixed(0)
              ),
            });
          } else {
            sisaKapasitas.push({
              mesin: data.mesin,
              kapasitas_mesin: data.kapasitas,
              total_kapasitas: findDataMesin.total_qty_druk,
              sisa_kapasitas_percent: parseInt(
                (
                  ((data.kapasitas - findDataMesin.total_qty_druk) /
                    data.kapasitas) *
                  100
                ).toFixed(0)
              ),
            });
          }
        } else {
          sisaKapasitas.push({
            mesin: data.mesin,
            kapasitas_mesin: data.kapasitas,
            total_kapasitas: 0,
            sisa_kapasitas_percent: 100,
          });
        }
      });
      return res.status(200).json({
        //data: dataBooking,
        data_booking: grouped,
        list_kapasitas_perbulan: listKapasitasMesin,
        sisa_kapasitas: sisaKapasitas,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

const listKapasitasMesin = [
  {
    mesin: "R700",
    kapasitas: 900000,
    proses: "cetak",
  },
  {
    mesin: "SM",
    kapasitas: 600000,
    proses: "cetak",
  },
  {
    mesin: "GTO",
    kapasitas: 350000,
    proses: "cetak",
  },
  {
    mesin: "HOCK",
    kapasitas: 1500000,
    proses: "coating",
  },
  {
    mesin: "MANUAL",
    kapasitas: 500000,
    proses: "coating",
  },
  {
    mesin: "BOARDER",
    kapasitas: 1400000,
    proses: "pond",
  },
  {
    mesin: "KSB",
    kapasitas: 300000,
    proses: "pond",
  },
  {
    mesin: "JK1000",
    kapasitas: 2500000,
    proses: "lem",
  },
  {
    mesin: "JK650",
    kapasitas: 4000000,
    proses: "lem",
  },
  {
    mesin: "LIPAT",
    kapasitas: 2000000,
    proses: "lipat",
  },
];

module.exports = ReportKapasitasController;
