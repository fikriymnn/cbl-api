const { Op, fn, col, literal, Sequelize } = require("sequelize");
const TicketOs2 = require("../../model/maintenaceTicketModel");
const masterMesin = require("../../model/masterData/masterMesinModel");
const MasterKodeAnalisa = require("../../model/masterData/masterKodeAnalisisModel");
const TicketOs3 = require("../../model/maintenanceTicketOs3Model");
const ProsesMtc = require("../../model/mtc/prosesMtc");
const Users = require("../../model/userModel");
const ReportMaintenance = {
  getDataResponTimeMinggu: async (req, res) => {
    const { tahun, bulan } = req.query;
    try {
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
              new Date(parseInt(tahun), parseInt(bulan) - 1, 1), // Awal bulan
              new Date(parseInt(tahun), parseInt(bulan), 0), // Akhir bulan
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
            jumlah_waktu_jam: 0,
            rata_rata_waktu_jam: 0,
            minggu: Array.from({ length: 5 }, (_, index) => ({
              Minggu_ke: index + 1,
              jumlah_waktu_menit: 0,
              rata_rata_waktu_menit: 0,
              jumlah_waktu_jam: 0,
              rata_rata_waktu_jam: 0,
            })),
          };
          acc.push(mesinData);
        }

        // Update minggu yang sesuai
        if (mingguKe >= 1 && mingguKe <= 5) {
          mesinData.minggu[mingguKe - 1].jumlah_waktu_menit = jumlahWaktuMenit;
          mesinData.minggu[mingguKe - 1].rata_rata_waktu_menit =
            rataRataWaktuMenit;

          mesinData.minggu[mingguKe - 1].jumlah_waktu_jam =
            parseFloat(jumlahWaktuMenit) / 60;
          mesinData.minggu[mingguKe - 1].rata_rata_waktu_jam =
            parseFloat(rataRataWaktuMenit) / 60;
        }

        // Update jumlah total waktu dan rata-rata waktu untuk mesin
        mesinData.jumlah_waktu_menit = mesinData.minggu.reduce(
          (sum, m) => sum + parseFloat(m.jumlah_waktu_menit),
          0
        );
        mesinData.rata_rata_waktu_menit =
          mesinData.minggu.reduce(
            (sum, m) => sum + parseFloat(m.rata_rata_waktu_menit),
            0
          ) / 5;

        // Update jumlah total waktu jam dan rata-rata waktu jam untuk mesin
        mesinData.jumlah_waktu_jam = mesinData.minggu.reduce(
          (sum, m) => sum + parseFloat(m.jumlah_waktu_menit) / 60,
          0
        );
        mesinData.rata_rata_waktu_jam =
          mesinData.minggu.reduce(
            (sum, m) => sum + parseFloat(m.rata_rata_waktu_menit) / 60,
            0
          ) / 5;

        return acc;
      }, []);

      res.status(200).json({ data: data });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  getDataResponTimeRange: async (req, res) => {
    const { fromDate, toDate } = req.query;

    // Rentang tanggal yang diinginkan (misalnya, ambil dari variabel)
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Array nama bulan dalam bahasa Indonesia
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Fungsi untuk mengubah nomor bulan menjadi nama bulan
    function getMonthName(monthNumber) {
      return monthNames[monthNumber - 1]; // -1 karena array index dimulai dari 0
    }

    // Fungsi untuk menghasilkan array bulan antara startDate dan endDate
    function generateMonthsRange(startDate, endDate) {
      const months = [];
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (start <= end) {
        months.push({
          month: start.getMonth() + 1, // Mendapatkan bulan
          nama_bulan: getMonthName(start.getMonth() + 1), //mendapatkan nama bulan
          year: start.getFullYear(), // Mendapatkan tahun
          rata_rata_waktu_menit: 0, // Default rata rata
          jumlah_waktu_menit: 0, //Default jumlah
          rata_rata_waktu_jam: 0, // Default rata rata jam
          jumlah_waktu_jam: 0, //Default jumlah jam
        });
        start.setMonth(start.getMonth() + 1); // Pindah ke bulan berikutnya
      }

      return months;
    }

    // Membuat array bulan dari rentang tanggal
    const defaultMonths = generateMonthsRange(startDate, endDate);
    try {
      const responTime = await TicketOs2.findAll({
        group: [
          "mesin",
          Sequelize.fn("YEAR", Sequelize.col("createdAt")),
          Sequelize.fn("MONTH", Sequelize.col("createdAt")),
        ],
        attributes: [
          "mesin",
          [Sequelize.literal("COUNT(*)"), "jumlah_tiket"],
          [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"], // Mengambil bulan dari createdAt
          [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
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
        ],
        where: {
          waktu_respon_qc: {
            [Op.ne]: null,
          },
          waktu_respon: {
            [Op.ne]: null,
          },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["mesin", "ASC"]],
        raw: true,
      });

      // Mengelompokkan data per mesin
      const groupedResults = responTime.reduce((acc, row) => {
        const mesin = row.mesin;

        // Jika mesin belum ada di objek, buat entry baru dengan key mesin
        if (!acc[mesin]) {
          acc[mesin] = {
            mesin: mesin,
            data: JSON.parse(JSON.stringify(defaultMonths)), // Copy default bulan (rentang yang dihasilkan dari generateMonthsRange)
          };
        }

        // Temukan bulan yang sesuai dalam array default bulan
        const foundMonth = acc[mesin].data.find(
          (m) => m.month === row.month && m.year === row.year
        );

        if (foundMonth) {
          // Jika bulan ditemukan, update total
          foundMonth.jumlah_waktu_menit = row.jumlah_waktu_menit;
          foundMonth.rata_rata_waktu_menit = row.rata_rata_waktu_menit;

          // Jika bulan ditemukan, update total jam
          foundMonth.jumlah_waktu_jam = parseFloat(row.jumlah_waktu_menit) / 60;
          foundMonth.rata_rata_waktu_jam =
            parseFloat(row.rata_rata_waktu_menit) / 60;
        }

        return acc;
      }, {});

      // Konversi objek hasil grouping ke dalam array
      const finalResult = Object.values(groupedResults);

      res.status(200).json({
        queryDari: startDate,
        querySampai: endDate,
        data: finalResult,
        listBulan: defaultMonths,
      });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  getDataBreakdownTimeMinggu: async (req, res) => {
    const { tahun, bulan } = req.query;
    try {
      const breakdownTime = await TicketOs2.findAll({
        group: ["mesin", "Minggu_ke"],
        attributes: [
          "mesin",
          [Sequelize.literal("COUNT(*)"), "jumlah_tiket"],
          [fn("MONTHNAME", col("createdAt")), "bulan"],
          [
            fn(
              "SUM",
              fn(
                "TIMESTAMPDIFF",
                literal("MINUTE"),
                col("createdAt"),
                col("waktu_selesai")
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
                col("createdAt"),
                col("waktu_selesai")
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
          // waktu_mulai_mtc: {
          //   [Op.ne]: null,
          // },
          waktu_selesai: {
            [Op.ne]: null,
          },
          createdAt: {
            [Op.between]: [
              new Date(parseInt(tahun), parseInt(bulan) - 1, 1), // Awal bulan
              new Date(parseInt(tahun), parseInt(bulan), 0), // Akhir bulan
            ],
          },
        },
        order: [
          ["mesin", "ASC"],
          ["Minggu_ke", "ASC"],
        ],
      });

      // Mengelompokkan data sesuai format JSON yang diinginkan dengan 5 minggu per bulan
      const data = breakdownTime.reduce((acc, result) => {
        const mesin = result.mesin;
        const bulan = result.dataValues.bulan;
        const mingguKe = result.dataValues.Minggu_ke;
        const jumlahWaktuMenit = result.dataValues.jumlah_waktu_menit || 0;
        const rataRataWaktuMenit = result.dataValues.rata_rata_waktu_menit || 0;
        const jumlahWaktuJam = (
          parseFloat(result.dataValues.jumlah_waktu_menit) / 60
        ).toFixed(3);
        const rataRataWaktuJam = (
          parseFloat(result.dataValues.rata_rata_waktu_menit) / 60
        ).toFixed(3);

        // Cari mesin dalam hasil yang sudah diproses
        let mesinData = acc.find((item) => item.mesin === mesin);

        // Jika tidak ditemukan, buat data baru untuk mesin tersebut
        if (!mesinData) {
          mesinData = {
            mesin: mesin,
            bulan: bulan,
            jumlah_waktu_menit: 0,
            rata_rata_waktu_menit: 0,
            jumlah_waktu_jam: 0,
            rata_rata_waktu_jam: 0,
            minggu: Array.from({ length: 5 }, (_, index) => ({
              Minggu_ke: index + 1,
              jumlah_waktu_menit: 0,
              rata_rata_waktu_menit: 0,
              jumlah_waktu_jam: 0,
              rata_rata_waktu_jam: 0,
            })),
          };
          acc.push(mesinData);
        }

        // Update minggu yang sesuai
        if (mingguKe >= 1 && mingguKe <= 5) {
          //menit
          mesinData.minggu[mingguKe - 1].jumlah_waktu_menit = jumlahWaktuMenit;
          mesinData.minggu[mingguKe - 1].rata_rata_waktu_menit =
            rataRataWaktuMenit;
          //jam
          mesinData.minggu[mingguKe - 1].jumlah_waktu_jam = jumlahWaktuJam;
          mesinData.minggu[mingguKe - 1].rata_rata_waktu_jam = rataRataWaktuJam;
        }

        // Update jumlah total waktu dan rata-rata waktu untuk mesin
        mesinData.jumlah_waktu_menit = mesinData.minggu.reduce(
          (sum, m) => sum + parseFloat(m.jumlah_waktu_menit),
          0
        );
        mesinData.rata_rata_waktu_menit = (
          mesinData.minggu.reduce(
            (sum, m) => sum + parseFloat(m.rata_rata_waktu_menit),
            0
          ) / 5
        ).toFixed(3);

        // Update jumlah total waktu jam dan rata-rata waktu jam untuk mesin
        mesinData.jumlah_waktu_jam = mesinData.minggu.reduce(
          (sum, m) => sum + parseFloat(m.jumlah_waktu_menit) / 60,
          0
        );
        mesinData.rata_rata_waktu_jam = (
          mesinData.minggu.reduce(
            (sum, m) => sum + parseFloat(m.rata_rata_waktu_menit) / 60,
            0
          ) / 5
        ).toFixed(3);

        return acc;
      }, []);

      res.status(200).json({ data: data, t: breakdownTime });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  getDataBreakdownTimeRange: async (req, res) => {
    const { fromDate, toDate, id_eksekutor } = req.query;

    // Rentang tanggal yang diinginkan (misalnya, ambil dari variabel)
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    let obj = {};
    if (id_eksekutor) obj.id_eksekutor = id_eksekutor;
    // Array nama bulan dalam bahasa Indonesia
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    // Fungsi untuk mengubah nomor bulan menjadi nama bulan
    function getMonthName(monthNumber) {
      return monthNames[monthNumber - 1]; // -1 karena array index dimulai dari 0
    }

    // Fungsi untuk menghasilkan array bulan antara startDate dan endDate
    function generateMonthsRange(startDate, endDate) {
      const months = [];
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (start <= end) {
        months.push({
          month: start.getMonth() + 1, // Mendapatkan bulan
          nama_bulan: getMonthName(start.getMonth() + 1), //mendapatkan nama bulan
          year: start.getFullYear(), // Mendapatkan tahun
          rata_rata_waktu_menit: 0, // Default rata rata
          jumlah_waktu_menit: 0, //Default jumlah
          rata_rata_waktu_jam: 0, // Default rata rata jam
          jumlah_waktu_jam: 0, //Default jumlah jam
        });
        start.setMonth(start.getMonth() + 1); // Pindah ke bulan berikutnya
      }

      return months;
    }

    // Membuat array bulan dari rentang tanggal
    const defaultMonths = generateMonthsRange(startDate, endDate);
    try {
      const bereakdownTime = await TicketOs2.findAll({
        include: [
          {
            model: ProsesMtc,
            where: obj,
            include: [
              {
                model: Users,
                as: "user_eksekutor",
                attributes: ["nama", "id"],
                raw: true,
              },
              {
                model: Users,
                as: "user_qc",
                attributes: ["nama"],
                raw: true,
              },
            ],
            raw: true,
            order: [["createdAt", "DESC"]], // Ambil proses terakhir berdasarkan waktu
          },
          {
            model: Users,
            as: "user_respon_qc",
            attributes: ["nama"],
          },
        ],
        group: [
          "ticket.mesin",
          Sequelize.fn("YEAR", Sequelize.col("ticket.createdAt")),
          Sequelize.fn("MONTH", Sequelize.col("ticket.createdAt")),
        ],
        attributes: [
          "mesin",
          [Sequelize.literal("COUNT(*)"), "jumlah_tiket"],
          [Sequelize.fn("MONTH", Sequelize.col("ticket.createdAt")), "month"], // Mengambil bulan dari ticket.createdAt
          [Sequelize.fn("YEAR", Sequelize.col("ticket.createdAt")), "year"],
          [fn("MONTHNAME", col("ticket.createdAt")), "bulan"],
          [
            fn(
              "SUM",
              fn(
                "TIMESTAMPDIFF",
                literal("MINUTE"),
                col("ticket.waktu_respon_qc"),
                col("ticket.waktu_selesai_mtc")
              )
            ),
            "jumlah_waktu_menit_mtc",
          ], // Menghitung jumlah waktu mtc dalam menit
          [
            fn(
              "SUM",
              fn(
                "TIMESTAMPDIFF",
                literal("MINUTE"),
                col("ticket.createdAt"),
                col("ticket.waktu_selesai")
              )
            ),
            "jumlah_waktu_menit",
          ], // Menghitung jumlah waktu keseluruhan dalam menit
          [
            fn(
              "AVG",
              fn(
                "TIMESTAMPDIFF",
                literal("MINUTE"),
                col("ticket.waktu_respon_qc"),
                col("ticket.waktu_selesai_mtc")
              )
            ),
            "rata_rata_waktu_menit_mtc",
          ], // Menghitung rata-rata waktu mtc
          [
            fn(
              "AVG",
              fn(
                "TIMESTAMPDIFF",
                literal("MINUTE"),
                col("ticket.createdAt"),
                col("ticket.waktu_selesai")
              )
            ),
            "rata_rata_waktu_menit",
          ], // Menghitung rata-rata waktu keseluruhan
          [
            Sequelize.fn(
              "GROUP_CONCAT",
              Sequelize.literal(
                `CONCAT('{ "operator": "', ticket.operator, '","eksekutor": "', (SELECT nama FROM users WHERE users.id = proses_mtcs.id_eksekutor LIMIT 1), '", "verifikator": "', (SELECT nama FROM users WHERE users.id = proses_mtcs.id_qc LIMIT 1), '", "no_jo": "', ticket.no_jo, '","kode_lkh": "', ticket.kode_lkh, '","nama_kendala": "', ticket.nama_kendala, '", "createdAt": "', ticket.createdAt, '", "waktu_selesai": "', ticket.waktu_selesai, '"}') SEPARATOR ','`
              )
            ),
            "details",
          ], // Menggabungkan data dalam string JSON
        ],

        where: {
          // waktu_mulai_mtc: {
          //   [Op.ne]: null,
          // },
          waktu_selesai: {
            [Op.ne]: null,
          },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["mesin", "ASC"]],
        raw: true,
      });

      //mengubah detail menjadi array
      bereakdownTime.forEach((item) => {
        try {
          item.details = item.details ? JSON.parse(`[${item.details}]`) : [];
        } catch (error) {
          console.error("Error parsing JSON:", error);
          item.details = [];
        }
      });

      // Mengelompokkan data per mesin
      const groupedResults = bereakdownTime.reduce((acc, row) => {
        const mesin = row.mesin;

        // Jika mesin belum ada di objek, buat entry baru dengan key mesin
        if (!acc[mesin]) {
          acc[mesin] = {
            mesin: mesin,
            data: JSON.parse(JSON.stringify(defaultMonths)), // Copy default bulan (rentang yang dihasilkan dari generateMonthsRange)
          };
        }
        // console.log([...defaultMonths]);

        // Temukan bulan yang sesuai dalam array default bulan
        const foundMonth = acc[mesin].data.find(
          (m) => m.month === row.month && m.year === row.year
        );

        if (foundMonth) {
          foundMonth.details = row.details;
          // Jika bulan ditemukan, update total
          foundMonth.jumlah_waktu_mtc_menit = parseFloat(
            row.jumlah_waktu_menit_mtc
          ).toFixed(3);
          foundMonth.rata_rata_waktu_mtc_menit = parseFloat(
            row.rata_rata_waktu_menit_mtc
          ).toFixed(3);
          foundMonth.jumlah_waktu_menit = parseFloat(
            row.jumlah_waktu_menit
          ).toFixed(3);
          foundMonth.rata_rata_waktu_menit = parseFloat(
            row.rata_rata_waktu_menit
          ).toFixed(3);
          foundMonth.jumlah_waktu_menit_qc = (
            parseFloat(row.jumlah_waktu_menit) -
            parseFloat(row.jumlah_waktu_menit_mtc)
          ).toFixed(3);
          foundMonth.rata_rata_waktu_menit_qc = (
            parseFloat(row.rata_rata_waktu_menit) -
            parseFloat(row.rata_rata_waktu_menit_mtc)
          ).toFixed(3);

          // Jika bulan ditemukan, update total jam
          foundMonth.jumlah_waktu_mtc_jam = (
            parseFloat(row.jumlah_waktu_menit_mtc) / 60
          ).toFixed(3);
          foundMonth.rata_rata_waktu_mtc_jam = (
            parseFloat(row.rata_rata_waktu_menit_mtc) / 60
          ).toFixed(3);
          foundMonth.jumlah_waktu_jam = (
            parseFloat(row.jumlah_waktu_menit) / 60
          ).toFixed(3);
          foundMonth.rata_rata_waktu_jam = (
            parseFloat(row.rata_rata_waktu_menit) / 60
          ).toFixed(3);
          foundMonth.jumlah_waktu_jam_qc = (
            (parseFloat(row.jumlah_waktu_menit) -
              parseFloat(row.jumlah_waktu_menit_mtc)) /
            60
          ).toFixed(3);
          foundMonth.rata_rata_waktu_jam_qc = (
            (parseFloat(row.rata_rata_waktu_menit) -
              parseFloat(row.rata_rata_waktu_menit_mtc)) /
            60
          ).toFixed(3);
        }

        return acc;
      }, {});

      // Konversi objek hasil grouping ke dalam array
      const finalResult = Object.values(groupedResults);

      res.status(200).json({
        //tes: bereakdownTime,
        queryDari: startDate,
        querySampai: endDate,
        data: finalResult,
        listBulan: defaultMonths,
      });
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
            status_qc: "di validasi",
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
            status_qc: "di validasi",
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

  getMesinByTicket: async (req, res) => {
    try {
      const mesinName = await TicketOs2.findAll({
        attributes: ["mesin"],
        group: ["mesin"],
      });
      res.status(200).json(mesinName);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getCaseOneMesinProblem: async (req, res) => {
    const { mesin_name, start_date, end_date } = req.query;
    const fromDate = new Date(start_date);
    const toDate = new Date(end_date);

    // Array nama bulan dalam bahasa Indonesia
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    //get master analisis produksi
    const masterKodeAnalisaProduksi = await MasterKodeAnalisa.findAll({
      attributes: ["kode_analisis"],
      where: {
        bagian_analisis: "produksi",
      },
    });

    // Fungsi untuk mengubah nomor bulan menjadi nama bulan
    function getMonthName(monthNumber) {
      return monthNames[monthNumber - 1]; // -1 karena array index dimulai dari 0
    }

    // Fungsi untuk menghasilkan array bulan antara startDate dan endDate
    function generateMonthsRange(startDate, endDate) {
      const months = [];
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (start <= end) {
        months.push({
          month: start.getMonth() + 1, // Mendapatkan bulan
          nama_bulan: getMonthName(start.getMonth() + 1), //mendapatkan nama bulan
          year: start.getFullYear(), // Mendapatkan tahun
          mesin: mesin_name,
          quality: 0, // Default rata rata
          produksi: 0, //Default jumlah
          total: 0,
        });
        start.setMonth(start.getMonth() + 1); // Pindah ke bulan berikutnya
      }

      return months;
    }

    // Membuat array bulan dari rentang tanggal
    const defaultMonths = generateMonthsRange(fromDate, toDate);
    try {
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
          [Sequelize.fn("COUNT", Sequelize.col("jenis_analisis_mtc")), "count"],
          [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"], // Mengambil bulan dari createdAt
          [Sequelize.fn("YEAR", Sequelize.col("createdAt")), "year"],
          [fn("MONTHNAME", col("createdAt")), "bulan"],
        ],
        group: ["mesin", "year", "month"],

        raw: true,
        where: {
          jenis_analisis_mtc: { [Op.ne]: null },
          createdAt: {
            [Op.between]: [fromDate, toDate],
          },
          mesin: mesin_name,
          status_qc: "di validasi",
        },
      });

      // Temukan bulan yang sesuai dalam array default bulan
      const groupedResults = jenisMasalah.reduce((acc, row) => {
        const mesin = row.mesin;

        if (!acc[mesin]) {
          acc[mesin] = {
            mesin: mesin,
            data: JSON.parse(JSON.stringify(defaultMonths)), // Copy default bulan (rentang yang dihasilkan dari generateMonthsRange)
          };
        }

        const foundMonth = acc[mesin].data.find(
          (m) => m.month === row.month && m.year === row.year
        );

        if (foundMonth) {
          // Jika bulan ditemukan, update total
          foundMonth.quality = parseInt(row.jenis_quality);
          foundMonth.produksi = parseInt(row.jenis_produksi);
          foundMonth.total =
            parseInt(row.jenis_quality) + parseInt(row.jenis_produksi);
        }

        return acc;
      }, {});

      // Konversi objek hasil grouping ke dalam array
      const finalResult = Object.values(groupedResults);
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

      const produksiDefect = await TicketOs2.findAll({
        attributes: [
          "kode_analisis_mtc",
          "nama_analisis_mtc",
          "mesin",
          [Sequelize.fn("COUNT", Sequelize.col("kode_analisis_mtc")), "count"],
        ],
        group: ["kode_analisis_mtc", "nama_analisis_mtc", "mesin"],
        raw: true,
        where: {
          jenis_analisis_mtc: "produksi",
          createdAt: {
            [Op.between]: [fromDate, toDate],
          },
          mesin: mesin_name,
          status_qc: "di validasi",
        },
      });

      const qualityDefect = await TicketOs2.findAll({
        attributes: [
          "kode_analisis_mtc",
          "nama_analisis_mtc",
          "mesin",
          [Sequelize.fn("COUNT", Sequelize.col("kode_analisis_mtc")), "count"],
        ],
        group: ["kode_analisis_mtc", "nama_analisis_mtc", "mesin"],
        raw: true,
        where: {
          jenis_analisis_mtc: "quality",
          createdAt: {
            [Op.between]: [fromDate, toDate],
          },
          mesin: mesin_name,
        },
      });

      res.status(200).json({
        data_jenis_masalah: {
          jenis_masalah: finalResult,
          total_count: totalCountJenisMalasah,
          total_quality: totalQualityJenisMalasah,
          total_produksi: totalProduksiJenisMalasah,
          kode_produksi: produksiDefect,
          kode_quality: qualityDefect,
        },
      });
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
            status_qc: "di validasi",
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
            status_qc: "di validasi",
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
            status_qc: "di validasi",
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
            status_qc: "di validasi",
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
