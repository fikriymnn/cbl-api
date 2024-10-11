const { Op, fn, col, literal, Sequelize } = require("sequelize");
const TicketOs2 = require("../../model/maintenaceTicketModel");
const TicketOs3 = require("../../model/maintenanceTicketOs3Model");
const ReportMaintenance = {
  getDataResponTime: async (req, res) => {
    try {
      const bulanYangDiinginkan = 9;
      const responTime = await TicketOs2.findAll({
        group: ["mesin", "Minggu_ke"],
        attributes: [
          "mesin",
          [fn("MONTHNAME", col("createdAt")), "bulan"],
          [
            fn(
              "SUM",
              fn(
                "TIMESTAMPDIFF",
                literal("MINUTE"),
                col("waktu_respon_qc"),
                col("waktu_respon")
              )
            ),
            "jumlah_waktu_menit",
          ], // Menghitung jumlah waktu dalam menit
          [
            fn(
              "AVG",
              fn(
                "TIMESTAMPDIFF",
                literal("MINUTE"),
                col("waktu_respon_qc"),
                col("waktu_respon")
              )
            ),
            "rata_rata_waktu_menit",
          ], // Menghitung rata-rata waktu
          [
            literal(
              `(DAY(createdAt) - 1 + WEEKDAY(DATE_SUB(createdAt, INTERVAL DAY(createdAt) - 1 DAY))) DIV 7 + 1`
            ),
            "Minggu_ke",
          ],
        ],
        where: {
          waktu_respon_qc: {
            [Op.ne]: null,
          },
          waktu_respon: {
            [Op.ne]: null,
          },
          createdAt: {
            [Op.between]: [
              new Date(2024, bulanYangDiinginkan - 1, 1), // Awal bulan
              new Date(2024, bulanYangDiinginkan, 0), // Akhir bulan
            ],
          },
        },
        order: [
          ["mesin", "ASC"],
          ["Minggu_ke", "ASC"],
        ],
      });

      // Mengelompokkan data sesuai format JSON yang diinginkan dengan 5 minggu per bulan
      const data = responTime.reduce((acc, result) => {
        const mesin = result.mesin;
        const bulan = result.dataValues.bulan;
        const mingguKe = result.dataValues.Minggu_ke;
        const jumlahWaktuMenit = result.dataValues.jumlah_waktu_menit || 0;
        const rataRataWaktuMenit = result.dataValues.rata_rata_waktu_menit || 0;

        // Cari mesin dalam hasil yang sudah diproses
        let mesinData = acc.find((item) => item.mesin === mesin);

        // Jika tidak ditemukan, buat data baru untuk mesin tersebut
        if (!mesinData) {
          mesinData = {
            mesin: mesin,
            bulan: bulan,
            jumlah_waktu_menit: 0,
            rata_rata_waktu_menit: 0,
            minggu: Array.from({ length: 5 }, (_, index) => ({
              Minggu_ke: index + 1,
              jumlah_waktu_menit: 0,
              rata_rata_waktu_menit: 0,
            })),
          };
          acc.push(mesinData);
        }

        // Update minggu yang sesuai
        if (mingguKe >= 1 && mingguKe <= 5) {
          mesinData.minggu[mingguKe - 1].jumlah_waktu_menit = jumlahWaktuMenit;
          mesinData.minggu[mingguKe - 1].rata_rata_waktu_menit =
            rataRataWaktuMenit;
        }

        // Update jumlah total waktu dan rata-rata waktu untuk mesin
        mesinData.jumlah_waktu_menit += jumlahWaktuMenit;
        mesinData.rata_rata_waktu_menit =
          mesinData.minggu.reduce(
            (sum, m) => sum + m.rata_rata_waktu_menit,
            0
          ) / 5;

        return acc;
      }, []);

      res.status(200).json({ data: data });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = ReportMaintenance;
