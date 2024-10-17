const { Op, fn, col, literal, Sequelize } = require("sequelize");
const TicketOs2 = require("../../model/maintenaceTicketModel");
const masterMesin = require("../../model/masterData/masterMesinModel");
const MasterKodeAnalisa = require("../../model/masterData/masterKodeAnalisisModel");
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

  getCaseMesinProblem: async (req, res) => {
    const { start_date, end_date } = req.query;
    const fromDate = new Date(start_date);
    const toDate = new Date(end_date);
    try {
      const masterMesinList = await masterMesin.findAll({
        attributes: ["nama_mesin"],
      });
      const masterKodeAnalisaProduksi = await MasterKodeAnalisa.findAll({
        attributes: ["kode_analisis"],
        where: {
          bagian_analisis: "produksi",
        },
      });

      if (start_date && end_date) {
        const jenisMasalah = await TicketOs2.findAll({
          attributes: [
            "mesin",
            [
              Sequelize.literal(
                'SUM(CASE WHEN jenis_analisis_mtc = "quality" THEN 1 ELSE 0 END)'
              ),
              "jenis_quality",
            ],
            [
              Sequelize.literal(
                'SUM(CASE WHEN jenis_analisis_mtc = "produksi" THEN 1 ELSE 0 END)'
              ),
              "jenis_produksi",
            ],
            [
              Sequelize.fn("COUNT", Sequelize.col("jenis_analisis_mtc")),
              "count",
            ],
          ],
          group: ["mesin"],
          raw: true,
          where: {
            jenis_analisis_mtc: { [Op.ne]: null },
            createdAt: {
              [Op.between]: [fromDate, toDate],
            },
          },
        });

        const totalCountJenisMalasah = jenisMasalah.reduce(
          (accumulator, currentValue) => {
            return accumulator + currentValue.count;
          },
          0
        );

        const totalProduksiJenisMalasah = jenisMasalah.reduce(
          (accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.jenis_produksi);
          },
          0
        );
        const totalQualityJenisMalasah = jenisMasalah.reduce(
          (accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.jenis_quality);
          },
          0
        );

        res.status(200).json({
          data_jenis_masalah: {
            jenis_masalah: jenisMasalah,
            total_count: totalCountJenisMalasah,
            total_quality: totalQualityJenisMalasah,
            total_produksi: totalProduksiJenisMalasah,
          },
        });
      } else {
        const jenisMasalah = await TicketOs2.findAll({
          attributes: [
            "mesin",
            [
              Sequelize.literal(
                'SUM(CASE WHEN jenis_analisis_mtc = "quality" THEN 1 ELSE 0 END)'
              ),
              "jenis_quality",
            ],
            [
              Sequelize.literal(
                'SUM(CASE WHEN jenis_analisis_mtc = "produksi" THEN 1 ELSE 0 END)'
              ),
              "jenis_produksi",
            ],
            [
              Sequelize.fn("COUNT", Sequelize.col("jenis_analisis_mtc")),
              "count",
            ],
          ],
          group: ["mesin"],
          raw: true,
          where: {
            jenis_analisis_mtc: { [Op.ne]: null },
          },
        });

        const totalCountJenisMalasah = jenisMasalah.reduce(
          (accumulator, currentValue) => {
            return accumulator + currentValue.count;
          },
          0
        );

        const totalProduksiJenisMalasah = jenisMasalah.reduce(
          (accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.jenis_produksi);
          },
          0
        );
        const totalQualityJenisMalasah = jenisMasalah.reduce(
          (accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.jenis_quality);
          },
          0
        );

        const result = {};
        jenisMasalah.forEach((item) => {
          result[item["mesin"]] = {
            nama: item.mesin,
            jenis_quality: item.jenis_quality,
            jenis_produksi: item.jenis_produksi,
            count: item.count,
          };
        });

        masterMesinList.forEach((machine) => {
          if (!result[machine.nama_mesin]) {
            result[machine["nama_mesin"]] = {
              nama: machine.mesin,
              jenis_quality: 0,
              jenis_produksi: 0,
              count: 0,
            };
          }
        });

        // console.log(resultAnalisisProdukasi);

        res.status(200).json({
          data_jenis_masalah: {
            jenis_masalah: jenisMasalah,
            total_count: totalCountJenisMalasah,
            total_quality: totalQualityJenisMalasah,
            total_produksi: totalProduksiJenisMalasah,
            jenis_masalah_dari_master: result,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getProduksiDefect: async (req, res) => {
    const { start_date, end_date } = req.query;
    const fromDate = new Date(start_date);
    const toDate = new Date(end_date);
    try {
      const masterMesinList = await masterMesin.findAll({
        attributes: ["nama_mesin"],
      });
      const masterKodeAnalisaProduksi = await MasterKodeAnalisa.findAll({
        attributes: ["kode_analisis"],
        where: {
          bagian_analisis: "produksi",
        },
      });

      if (start_date && end_date) {
        const produksiDefect = await TicketOs2.findAll({
          attributes: [
            "kode_analisis_mtc",
            "nama_analisis_mtc",
            [
              Sequelize.fn("COUNT", Sequelize.col("kode_analisis_mtc")),
              "count",
            ],
          ],
          group: ["kode_analisis_mtc", "nama_analisis_mtc"],
          raw: true,
          where: {
            jenis_analisis_mtc: "produksi",
            kode_analisis_mtc: { [Op.ne]: null },
            createdAt: {
              [Op.between]: [fromDate, toDate],
            },
          },
        });
        const totalCount = produksiDefect.reduce(
          (accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.count);
          },
          0
        );

        res.status(200).json({
          data: {
            produksi_defect: produksiDefect,
            total_count: totalCount,
          },
        });
      } else {
        const produksiDefect = await TicketOs2.findAll({
          attributes: [
            "kode_analisis_mtc",
            "nama_analisis_mtc",
            [
              Sequelize.fn("COUNT", Sequelize.col("kode_analisis_mtc")),
              "count",
            ],
          ],
          group: ["kode_analisis_mtc", "nama_analisis_mtc"],
          raw: true,
          where: {
            jenis_analisis_mtc: "produksi",
            kode_analisis_mtc: { [Op.ne]: null },
          },
        });

        const totalCount = produksiDefect.reduce(
          (accumulator, currentValue) => {
            return accumulator + parseInt(currentValue.count);
          },
          0
        );

        let resultAnalisisProdukasi = [];
        produksiDefect.forEach((item, i) => {
          resultAnalisisProdukasi[i] = {
            kode_analisis_mtc: item.kode_analisis_mtc,
            nama_analisis_mtc: item.nama_analisis_mtc,
            count: item.count,
          };
        });

        masterKodeAnalisaProduksi.forEach((kode) => {
          if (!resultAnalisisProdukasi[kode.kode_analisis]) {
            resultAnalisisProdukasi[kode["kode_analisis"]] = {
              kode_analisis_mtc: kode.kode_analisis,
              nama_analisis_mtc: kode.nama_analisis,
              count: 0,
            };
          }
        });
        // console.log(resultAnalisisProdukasi);

        res.status(200).json({
          data: {
            produksi_defect: produksiDefect,
            total_count: totalCount,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getQualityDefect: async (req, res) => {
    const { start_date, end_date } = req.query;
    const fromDate = new Date(start_date);
    const toDate = new Date(end_date);
    try {
      const masterMesinList = await masterMesin.findAll({
        attributes: ["nama_mesin"],
      });
      const masterKodeAnalisaProduksi = await MasterKodeAnalisa.findAll({
        attributes: ["kode_analisis"],
        where: {
          bagian_analisis: "produksi",
        },
      });

      if (start_date && end_date) {
        const qualityDefect = await TicketOs2.findAll({
          attributes: [
            "kode_analisis_mtc",
            "nama_analisis_mtc",
            [
              Sequelize.fn("COUNT", Sequelize.col("kode_analisis_mtc")),
              "count",
            ],
          ],
          group: ["kode_analisis_mtc", "nama_analisis_mtc"],
          raw: true,
          where: {
            jenis_analisis_mtc: "quality",
            kode_analisis_mtc: { [Op.ne]: null },
            createdAt: {
              [Op.between]: [fromDate, toDate],
            },
          },
        });

        const totalCount = qualityDefect.reduce((accumulator, currentValue) => {
          return accumulator + parseInt(currentValue.count);
        }, 0);

        res.status(200).json({
          data: {
            quality_defect: qualityDefect,
            total_count: totalCount,
          },
        });
      } else {
        const qualityDefect = await TicketOs2.findAll({
          attributes: [
            "kode_analisis_mtc",
            "nama_analisis_mtc",
            [
              Sequelize.fn("COUNT", Sequelize.col("kode_analisis_mtc")),
              "count",
            ],
          ],
          group: ["kode_analisis_mtc", "nama_analisis_mtc"],
          raw: true,
          where: {
            jenis_analisis_mtc: "quality",
            kode_analisis_mtc: { [Op.ne]: null },
          },
        });
        const totalCount = qualityDefect.reduce((accumulator, currentValue) => {
          return accumulator + parseInt(currentValue.count);
        }, 0);

        // console.log(resultAnalisisProdukasi);

        res.status(200).json({
          data: {
            quality_defect: qualityDefect,
            total_count: totalCount,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = ReportMaintenance;
