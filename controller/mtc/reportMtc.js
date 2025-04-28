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
      // Tanggal awal dan akhir bulan
      const startDate = new Date(tahun, bulan - 1, 1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tahun, bulan, 0);
      endDate.setHours(23, 59, 59, 999);

      // Dapatkan semua tiket untuk bulan ini
      const allTickets = await TicketOs2.findAll({
        attributes: [
          "id",
          "mesin",
          "createdAt",
          "waktu_respon",
          "waktu_respon_qc",
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
        raw: true,
      });

      console.log(`Total tickets for ${bulan}-${tahun}: ${allTickets.length}`);

      // Fungsi untuk menentukan minggu (Minggu-Sabtu)
      function getWeekNumber(date) {
        // Dapatkan hari pertama bulan
        const firstDayOfMonth = new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        );

        // Tentukan tanggal Minggu pertama
        const firstSunday = new Date(firstDayOfMonth);
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Minggu, 1 = Senin, dst.

        // Jika bukan Minggu, kembali ke Minggu sebelumnya
        if (firstDayOfWeek > 0) {
          firstSunday.setDate(firstSunday.getDate() - firstDayOfWeek);
        }

        // Hitung berapa minggu sudah berlalu sejak Minggu pertama
        const diffTime = date - firstSunday;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diffDays / 7) + 1;

        return weekNumber;
      }

      // Fungsi untuk mendapatkan rentang tanggal untuk minggu tertentu
      function getWeekDateRange(year, month, weekNum) {
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Minggu, 1 = Senin, dst.

        // Tentukan tanggal Minggu pertama
        const firstSunday = new Date(firstDayOfMonth);
        if (firstDayOfWeek > 0) {
          firstSunday.setDate(firstSunday.getDate() - firstDayOfWeek);
        }

        // Hitung tanggal awal minggu yang diminta
        const weekStartDate = new Date(firstSunday);
        weekStartDate.setDate(firstSunday.getDate() + (weekNum - 1) * 7);

        // Hitung tanggal akhir minggu (Sabtu)
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);

        // Batasi tanggal dalam bulan yang diminta
        const monthStartDate = new Date(year, month - 1, 1);
        const monthEndDate = new Date(year, month, 0);

        const actualStartDate = new Date(
          Math.max(weekStartDate, monthStartDate)
        );
        const actualEndDate = new Date(Math.min(weekEndDate, monthEndDate));

        return {
          startDate: actualStartDate,
          endDate: actualEndDate,
        };
      }

      // Format tanggal untuk Indonesia (DD/MM/YYYY)
      function formatDate(date) {
        return `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
      }

      // Hitung respon time per mesin dari data mentah
      const mesinTotals = {};
      allTickets.forEach((ticket) => {
        const mesin = ticket.mesin;
        const responQC = new Date(ticket.waktu_respon_qc);
        const respon = new Date(ticket.waktu_respon);
        const createdAt = new Date(ticket.createdAt);

        // Hitung waktu respon dalam menit
        const responTimeMinutes = (respon - responQC) / (1000 * 60);

        if (!mesinTotals[mesin]) {
          mesinTotals[mesin] = {
            totalMinutes: 0,
            ticketCount: 0,
            tickets: [],
          };
        }

        mesinTotals[mesin].totalMinutes += responTimeMinutes;
        mesinTotals[mesin].ticketCount += 1;
        mesinTotals[mesin].tickets.push({
          id: ticket.id,
          responTimeMinutes,
          createdAt,
          // Hitung minggu berdasarkan hari Minggu-Sabtu
          week: getWeekNumber(createdAt),
        });
      });

      // Mengelompokkan data sesuai format yang diinginkan
      const data = [];

      // Untuk setiap mesin, tambahkan data total dan data per minggu
      Object.keys(mesinTotals).forEach((mesin) => {
        const mesinData = mesinTotals[mesin];
        const totalMinutes = mesinData.totalMinutes;
        const avgMinutes =
          mesinData.ticketCount > 0 ? totalMinutes / mesinData.ticketCount : 0;

        // Format dengan presisi 3 digit desimal
        const jumlahWaktuMenit = parseFloat(totalMinutes).toFixed(3);
        const rataRataWaktuMenit = parseFloat(avgMinutes).toFixed(3);
        const jumlahWaktuJam = (parseFloat(jumlahWaktuMenit) / 60).toFixed(3);
        const rataRataWaktuJam = (parseFloat(rataRataWaktuMenit) / 60).toFixed(
          3
        );

        // Hitung total per minggu - selalu 5 minggu
        const weeklyData = {};
        // Inisialisasi data untuk 5 minggu
        for (let i = 1; i <= 5; i++) {
          weeklyData[i] = {
            totalMinutes: 0,
            ticketCount: 0,
          };
        }

        // Isi data dari tiket
        mesinData.tickets.forEach((ticket) => {
          const weekNum = ticket.week;
          // Hanya mencatat minggu 1-5, minggu lainnya diabaikan
          if (weekNum >= 1 && weekNum <= 5) {
            weeklyData[weekNum].totalMinutes += ticket.responTimeMinutes;
            weeklyData[weekNum].ticketCount += 1;
          }
        });

        // Buat objek mesin dengan semua data yang diperlukan
        const mesinResult = {
          mesin: mesin,
          bulan: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
            startDate
          ),
          jumlah_waktu_menit: jumlahWaktuMenit,
          rata_rata_waktu_menit: rataRataWaktuMenit,
          jumlah_waktu_jam: jumlahWaktuJam,
          rata_rata_waktu_jam: rataRataWaktuJam,
          minggu: [],
        };

        // Tambahkan data per minggu - selalu 5 minggu
        for (let i = 1; i <= 5; i++) {
          const weekly = weeklyData[i];
          const weeklyTotalMinutes = parseFloat(weekly.totalMinutes).toFixed(3);
          const weeklyAvgMinutes =
            weekly.ticketCount > 0
              ? parseFloat(weekly.totalMinutes / weekly.ticketCount).toFixed(3)
              : "0.000";

          // Dapatkan rentang tanggal untuk minggu ini
          const dateRange = getWeekDateRange(
            parseInt(tahun),
            parseInt(bulan),
            i
          );
          const tanggalMulai = formatDate(dateRange.startDate);
          const tanggalSelesai = formatDate(dateRange.endDate);

          mesinResult.minggu.push({
            Minggu_ke: i,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            jumlah_waktu_menit: weeklyTotalMinutes,
            rata_rata_waktu_menit: weeklyAvgMinutes,
            jumlah_waktu_jam: (parseFloat(weeklyTotalMinutes) / 60).toFixed(3),
            rata_rata_waktu_jam: (parseFloat(weeklyAvgMinutes) / 60).toFixed(3),
          });
        }

        data.push(mesinResult);
      });

      res.status(200).json({
        data: data,
        totalTickets: allTickets.length,
      });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  getDataResponTimeRange: async (req, res) => {
    const { fromDate, toDate } = req.query;
    try {
      // Rentang tanggal yang diinginkan
      const startDate = new Date(fromDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);

      // Dapatkan semua tiket untuk rentang tanggal ini, mirip dengan metode weekly
      const allTickets = await TicketOs2.findAll({
        attributes: [
          "id",
          "mesin",
          "createdAt",
          "waktu_respon",
          "waktu_respon_qc",
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
        raw: true,
      });

      console.log(
        `Total tickets for range ${fromDate} to ${toDate}: ${allTickets.length}`
      );

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

      // Fungsi untuk membuat rentang bulan
      function generateMonthsRange(startDate, endDate) {
        const months = [];
        const start = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          1
        );
        const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

        while (start <= end) {
          months.push({
            month: start.getMonth() + 1,
            nama_bulan: monthNames[start.getMonth()],
            year: start.getFullYear(),
            rata_rata_waktu_menit: "0.000",
            jumlah_waktu_menit: "0.000",
            rata_rata_waktu_jam: "0.000",
            jumlah_waktu_jam: "0.000",
          });
          start.setMonth(start.getMonth() + 1);
        }
        return months;
      }

      // Membuat array bulan dari rentang tanggal
      const defaultMonths = generateMonthsRange(startDate, endDate);

      // Mengelompokkan data per mesin dan bulan
      const mesinMonthTotals = {};

      // Proses semua tiket untuk menghitung respon time
      allTickets.forEach((ticket) => {
        const mesin = ticket.mesin;
        const responQC = new Date(ticket.waktu_respon_qc);
        const respon = new Date(ticket.waktu_respon);
        const createdAt = new Date(ticket.createdAt);
        const ticketMonth = createdAt.getMonth() + 1;
        const ticketYear = createdAt.getFullYear();

        // Hitung waktu respon dalam menit (sama dengan metode weekly)
        const responTimeMinutes = (respon - responQC) / (1000 * 60);

        // Inisialisasi data mesin jika belum ada
        if (!mesinMonthTotals[mesin]) {
          mesinMonthTotals[mesin] = {
            mesin: mesin,
            data: JSON.parse(JSON.stringify(defaultMonths)), // Copy default bulan
            tickets: [],
          };
        }

        // Tambahkan data tiket ke array tiket mesin tersebut
        mesinMonthTotals[mesin].tickets.push({
          id: ticket.id,
          responTimeMinutes,
          createdAt,
          month: ticketMonth,
          year: ticketYear,
        });
      });

      // Hitung total dan rata-rata per bulan untuk setiap mesin
      Object.keys(mesinMonthTotals).forEach((mesin) => {
        const mesinData = mesinMonthTotals[mesin];

        // Mengelompokkan tiket berdasarkan bulan dan tahun
        const monthData = {};
        mesinData.tickets.forEach((ticket) => {
          const key = `${ticket.year}-${ticket.month}`;
          if (!monthData[key]) {
            monthData[key] = {
              totalMinutes: 0,
              ticketCount: 0,
            };
          }
          monthData[key].totalMinutes += ticket.responTimeMinutes;
          monthData[key].ticketCount += 1;
        });

        // Mengisi data per bulan
        mesinData.data.forEach((month) => {
          const key = `${month.year}-${month.month}`;
          if (monthData[key]) {
            const totalMinutes = monthData[key].totalMinutes;
            const ticketCount = monthData[key].ticketCount;
            const avgMinutes = ticketCount > 0 ? totalMinutes / ticketCount : 0;

            // Format dengan 3 digit desimal sama seperti di metode weekly
            month.jumlah_waktu_menit = parseFloat(totalMinutes).toFixed(3);
            month.rata_rata_waktu_menit = parseFloat(avgMinutes).toFixed(3);
            month.jumlah_waktu_jam = (parseFloat(totalMinutes) / 60).toFixed(3);
            month.rata_rata_waktu_jam = (parseFloat(avgMinutes) / 60).toFixed(
              3
            );
          }
        });
      });

      // Konversi objek hasil grouping ke dalam array
      const finalResult = Object.values(mesinMonthTotals).map((item) => {
        const { tickets, ...rest } = item; // Hapus array tickets dari output
        return rest;
      });

      res.status(200).json({
        queryDari: startDate,
        querySampai: endDate,
        data: finalResult,
        listBulan: defaultMonths,
        totalTickets: allTickets.length,
      });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  getDataBreakdownTimeMinggu: async (req, res) => {
    const { tahun, bulan } = req.query;
    try {
      // Tanggal awal dan akhir bulan
      const startDate = new Date(tahun, bulan - 1, 1);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tahun, bulan, 0);
      endDate.setHours(23, 59, 59, 999);

      // Dapatkan semua tiket untuk bulan ini - digunakan untuk perhitungan akurat
      const allTickets = await TicketOs2.findAll({
        attributes: ["id", "mesin", "createdAt", "waktu_selesai"],
        where: {
          waktu_selesai: {
            [Op.ne]: null,
          },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        raw: true,
      });

      console.log(`Total tickets for ${bulan}-${tahun}: ${allTickets.length}`);

      // Fungsi untuk menentukan minggu (Minggu-Sabtu)
      function getWeekNumber(date) {
        // Dapatkan hari pertama bulan
        const firstDayOfMonth = new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        );

        // Tentukan tanggal Minggu pertama
        // Jika hari pertama bulan adalah Minggu (0), gunakan tanggal tersebut
        // Jika tidak, hitung tanggal Minggu sebelumnya
        const firstSunday = new Date(firstDayOfMonth);
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Minggu, 1 = Senin, dst.

        // Jika bukan Minggu, kembali ke Minggu sebelumnya
        if (firstDayOfWeek > 0) {
          firstSunday.setDate(firstSunday.getDate() - firstDayOfWeek);
        }

        // Hitung berapa minggu sudah berlalu sejak Minggu pertama
        const diffTime = date - firstSunday;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(diffDays / 7) + 1;

        return weekNumber;
      }

      // Fungsi untuk mendapatkan rentang tanggal untuk minggu tertentu
      function getWeekDateRange(year, month, weekNum) {
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Minggu, 1 = Senin, dst.

        // Tentukan tanggal Minggu pertama
        const firstSunday = new Date(firstDayOfMonth);
        if (firstDayOfWeek > 0) {
          firstSunday.setDate(firstSunday.getDate() - firstDayOfWeek);
        }

        // Hitung tanggal awal minggu yang diminta
        const weekStartDate = new Date(firstSunday);
        weekStartDate.setDate(firstSunday.getDate() + (weekNum - 1) * 7);

        // Hitung tanggal akhir minggu (Sabtu)
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);

        // Batasi tanggal dalam bulan yang diminta
        const monthStartDate = new Date(year, month - 1, 1);
        const monthEndDate = new Date(year, month, 0);

        const actualStartDate = new Date(
          Math.max(weekStartDate, monthStartDate)
        );
        const actualEndDate = new Date(Math.min(weekEndDate, monthEndDate));

        return {
          startDate: actualStartDate,
          endDate: actualEndDate,
        };
      }

      // Pertama, hitung total waktu per mesin dari data mentah
      const mesinTotals = {};
      allTickets.forEach((ticket) => {
        const mesin = ticket.mesin;
        const createdAt = new Date(ticket.createdAt);
        const waktuSelesai = new Date(ticket.waktu_selesai);

        // Hitung waktu dalam menit
        const durationMinutes = (waktuSelesai - createdAt) / (1000 * 60);

        if (!mesinTotals[mesin]) {
          mesinTotals[mesin] = {
            totalMinutes: 0,
            ticketCount: 0,
            tickets: [],
          };
        }

        mesinTotals[mesin].totalMinutes += durationMinutes;
        mesinTotals[mesin].ticketCount += 1;
        mesinTotals[mesin].tickets.push({
          id: ticket.id,
          durationMinutes,
          createdAt,
          // Hitung minggu berdasarkan hari Minggu-Sabtu
          week: getWeekNumber(createdAt),
        });
      });

      // Mengelompokkan data sesuai format yang diinginkan
      const data = [];

      // Format tanggal untuk Indonesia (DD/MM/YYYY)
      function formatDate(date) {
        return `${date.getDate().toString().padStart(2, "0")}/${(
          date.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${date.getFullYear()}`;
      }

      // Untuk setiap mesin, tambahkan data total dan data per minggu
      Object.keys(mesinTotals).forEach((mesin) => {
        const mesinData = mesinTotals[mesin];
        const totalMinutes = mesinData.totalMinutes;
        const avgMinutes =
          mesinData.ticketCount > 0 ? totalMinutes / mesinData.ticketCount : 0;

        // Format dengan presisi 3 digit desimal
        const jumlahWaktuMenit = parseFloat(totalMinutes).toFixed(3);
        const rataRataWaktuMenit = parseFloat(avgMinutes).toFixed(3);
        const jumlahWaktuJam = (parseFloat(jumlahWaktuMenit) / 60).toFixed(3);
        const rataRataWaktuJam = (parseFloat(rataRataWaktuMenit) / 60).toFixed(
          3
        );

        // Hitung total per minggu - selalu 5 minggu
        const weeklyData = {};
        // Inisialisasi data untuk 5 minggu
        for (let i = 1; i <= 5; i++) {
          weeklyData[i] = {
            totalMinutes: 0,
            ticketCount: 0,
          };
        }

        // Isi data dari tiket
        mesinData.tickets.forEach((ticket) => {
          const weekNum = ticket.week;
          // Hanya mencatat minggu 1-5, minggu lainnya diabaikan
          if (weekNum >= 1 && weekNum <= 5) {
            weeklyData[weekNum].totalMinutes += ticket.durationMinutes;
            weeklyData[weekNum].ticketCount += 1;
          }
        });

        // Buat objek mesin dengan semua data yang diperlukan
        const mesinResult = {
          mesin: mesin,
          bulan: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
            startDate
          ),
          jumlah_waktu_menit: jumlahWaktuMenit,
          rata_rata_waktu_menit: rataRataWaktuMenit,
          jumlah_waktu_jam: jumlahWaktuJam,
          rata_rata_waktu_jam: rataRataWaktuJam,
          minggu: [],
        };

        // Tambahkan data per minggu - selalu 5 minggu
        for (let i = 1; i <= 5; i++) {
          const weekly = weeklyData[i];
          const weeklyTotalMinutes = parseFloat(weekly.totalMinutes).toFixed(3);
          const weeklyAvgMinutes =
            weekly.ticketCount > 0
              ? parseFloat(weekly.totalMinutes / weekly.ticketCount).toFixed(3)
              : "0.000";

          // Dapatkan rentang tanggal untuk minggu ini
          const dateRange = getWeekDateRange(
            parseInt(tahun),
            parseInt(bulan),
            i
          );
          const tanggalMulai = formatDate(dateRange.startDate);
          const tanggalSelesai = formatDate(dateRange.endDate);

          mesinResult.minggu.push({
            Minggu_ke: i,
            tanggal_mulai: tanggalMulai,
            tanggal_selesai: tanggalSelesai,
            jumlah_waktu_menit: weeklyTotalMinutes,
            rata_rata_waktu_menit: weeklyAvgMinutes,
            jumlah_waktu_jam: (parseFloat(weeklyTotalMinutes) / 60).toFixed(3),
            rata_rata_waktu_jam: (parseFloat(weeklyAvgMinutes) / 60).toFixed(3),
          });
        }

        data.push(mesinResult);
      });

      res.status(200).json({
        data: data,
        totalTickets: allTickets.length,
      });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  getDataBreakdownTimeRange: async (req, res) => {
    const { fromDate, toDate, id_eksekutor } = req.query;

    // Rentang tanggal yang diinginkan
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    startDate.setHours(0, 0, 0, 0);

    endDate.setHours(23, 59, 59, 999);

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
      return monthNames[monthNumber - 1];
    }

    // Fungsi untuk menghasilkan array bulan antara startDate dan endDate
    function generateMonthsRange(startDate, endDate) {
      const months = [];
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

      while (start <= end) {
        months.push({
          month: start.getMonth() + 1,
          nama_bulan: getMonthName(start.getMonth() + 1),
          year: start.getFullYear(),
          rata_rata_waktu_menit: "0.000",
          jumlah_waktu_menit: "0.000",
          rata_rata_waktu_jam: "0.000",
          jumlah_waktu_jam: "0.000",
        });
        start.setMonth(start.getMonth() + 1);
      }

      return months;
    }

    // Membuat array bulan dari rentang tanggal
    const defaultMonths = generateMonthsRange(startDate, endDate);

    try {
      // Dapatkan semua tiket untuk rentang - digunakan untuk perhitungan akurat
      const allTickets = await TicketOs2.findAll({
        include: [
          {
            model: ProsesMtc,
            where: obj,
            include: [
              {
                model: Users,
                as: "user_eksekutor",
                attributes: ["nama", "id"],
              },
              {
                model: Users,
                as: "user_qc",
                attributes: ["nama"],
              },
            ],
          },
          {
            model: Users,
            as: "user_respon_qc",
            attributes: ["nama"],
          },
        ],
        attributes: [
          "id",
          "mesin",
          "createdAt",
          "waktu_selesai",
          "waktu_respon_qc",
          "waktu_respon",
          "waktu_selesai_mtc",
          "operator",
          "no_jo",
          "kode_lkh",
          "nama_kendala",
        ],
        where: {
          waktu_selesai: {
            [Op.ne]: null,
          },
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        raw: false,
      });

      console.log(`Total tickets for range: ${allTickets.length}`);

      // Fungsi untuk mendapatkan key bulan dari tanggal
      function getMonthKey(date) {
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
      }

      // Mengolah tiket untuk perhitungan
      const ticketsByMesinAndMonth = {};

      allTickets.forEach((ticket) => {
        const mesin = ticket.mesin;
        const createdAt = new Date(ticket.createdAt);
        const monthKey = getMonthKey(createdAt);
        const month = createdAt.getMonth() + 1;
        const year = createdAt.getFullYear();
        const monthName = getMonthName(month);

        // Waktu total tiket
        const waktuSelesai = new Date(ticket.waktu_selesai);
        const totalDurationMinutes = (waktuSelesai - createdAt) / (1000 * 60);

        // Waktu MTC (jika tersedia)
        let mtcDurationMinutes = 0;
        if (ticket.waktu_respon_qc && ticket.waktu_selesai_mtc) {
          const waktuResponQc = new Date(ticket.waktu_respon_qc);
          const waktuSelesaiMtc = new Date(ticket.waktu_selesai_mtc);
          mtcDurationMinutes = (waktuSelesaiMtc - waktuResponQc) / (1000 * 60);
        }

        // Buat struktur data jika belum ada
        if (!ticketsByMesinAndMonth[mesin]) {
          ticketsByMesinAndMonth[mesin] = {};
        }

        if (!ticketsByMesinAndMonth[mesin][monthKey]) {
          ticketsByMesinAndMonth[mesin][monthKey] = {
            month,
            year,
            monthName,
            totalDurationMinutes: 0,
            mtcDurationMinutes: 0,
            ticketCount: 0,
            tickets: [],
          };
        }

        // Tambahkan durasi
        ticketsByMesinAndMonth[mesin][monthKey].totalDurationMinutes +=
          totalDurationMinutes;
        ticketsByMesinAndMonth[mesin][monthKey].mtcDurationMinutes +=
          mtcDurationMinutes;
        ticketsByMesinAndMonth[mesin][monthKey].ticketCount += 1;

        // Detail tiket
        let ticketDetails = {
          operator: ticket.operator || "",
          eksekutor:
            ticket.proses_mtcs?.length > 0
              ? ticket.proses_mtcs[0].user_eksekutor?.nama || ""
              : "",
          verifikator:
            ticket.proses_mtcs?.length > 0
              ? ticket.proses_mtcs[0].user_qc?.nama || ""
              : "",
          no_jo: ticket.no_jo || "",
          kode_lkh: ticket.kode_lkh || "",
          nama_kendala: ticket.nama_kendala || "",
          createdAt: ticket.createdAt,
          waktu_respon_qc: ticket.waktu_respon_qc,
          waktu_respon_mtc: ticket.waktu_respon,
          waktu_mulai_mtc: ticket.waktu_mulai_mtc,
          waktu_selesai_mtc: ticket.waktu_selesai_mtc,
          waktu_selesai: ticket.waktu_selesai,
        };

        ticketsByMesinAndMonth[mesin][monthKey].tickets.push(ticketDetails);
      });

      // Format hasil
      const finalResult = [];

      Object.keys(ticketsByMesinAndMonth).forEach((mesin) => {
        const mesinMonths = ticketsByMesinAndMonth[mesin];
        const mesinData = {
          mesin,
          data: JSON.parse(JSON.stringify(defaultMonths)), // Salin template bulan
        };

        // Isi dengan data aktual
        Object.keys(mesinMonths).forEach((monthKey) => {
          const monthData = mesinMonths[monthKey];
          const monthIndex = mesinData.data.findIndex(
            (m) => m.month === monthData.month && m.year === monthData.year
          );

          if (monthIndex !== -1) {
            // Total waktu
            const totalMinutes = parseFloat(
              monthData.totalDurationMinutes
            ).toFixed(3);
            const avgMinutes =
              monthData.ticketCount > 0
                ? parseFloat(
                    monthData.totalDurationMinutes / monthData.ticketCount
                  ).toFixed(3)
                : "0.000";

            // Waktu MTC
            const mtcMinutes = parseFloat(monthData.mtcDurationMinutes).toFixed(
              3
            );
            const avgMtcMinutes =
              monthData.ticketCount > 0
                ? parseFloat(
                    monthData.mtcDurationMinutes / monthData.ticketCount
                  ).toFixed(3)
                : "0.000";

            // Waktu QC (total - mtc)
            const qcMinutes = (
              parseFloat(totalMinutes) - parseFloat(mtcMinutes)
            ).toFixed(3);
            const avgQcMinutes = (
              parseFloat(avgMinutes) - parseFloat(avgMtcMinutes)
            ).toFixed(3);

            // Perbaharui data bulan
            mesinData.data[monthIndex] = {
              ...mesinData.data[monthIndex],
              details: monthData.tickets,

              // Total
              jumlah_waktu_menit: totalMinutes,
              rata_rata_waktu_menit: avgMinutes,
              jumlah_waktu_jam: (parseFloat(totalMinutes) / 60).toFixed(3),
              rata_rata_waktu_jam: (parseFloat(avgMinutes) / 60).toFixed(3),

              // MTC
              jumlah_waktu_mtc_menit: mtcMinutes,
              rata_rata_waktu_mtc_menit: avgMtcMinutes,
              jumlah_waktu_mtc_jam: (parseFloat(mtcMinutes) / 60).toFixed(3),
              rata_rata_waktu_mtc_jam: (parseFloat(avgMtcMinutes) / 60).toFixed(
                3
              ),

              // QC
              jumlah_waktu_menit_qc: qcMinutes,
              rata_rata_waktu_menit_qc: avgQcMinutes,
              jumlah_waktu_jam_qc: (parseFloat(qcMinutes) / 60).toFixed(3),
              rata_rata_waktu_jam_qc: (parseFloat(avgQcMinutes) / 60).toFixed(
                3
              ),
            };
          }
        });

        finalResult.push(mesinData);
      });

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

// Fungsi untuk menghitung breakdown time dari data mentah
function calculateBreakdownTime(ticketData) {
  // Kelompokkan data berdasarkan mesin dan minggu
  const groupedData = {};

  ticketData.forEach((ticket) => {
    const ticketObj = ticket.toJSON ? ticket.toJSON() : ticket;
    const createdAt = new Date(ticketObj.createdAt);

    // Hitung minggu ke berapa dalam bulan
    const startOfMonth = new Date(
      createdAt.getFullYear(),
      createdAt.getMonth(),
      1
    );
    const dayOfMonth = createdAt.getDate();
    const dayOfWeek = startOfMonth.getDay(); // 0 = Minggu, 1 = Senin, dst.
    const weekNumber = Math.ceil((dayOfMonth + dayOfWeek - 1) / 7);

    // Hitung selisih waktu dalam menit
    const waktuSelesai = new Date(ticketObj.waktu_selesai);
    const timeDiffMinutes = (waktuSelesai - createdAt) / (1000 * 60);

    // Buat key untuk pengelompokan
    const key = `${ticketObj.mesin}_${weekNumber}`;

    if (!groupedData[key]) {
      groupedData[key] = {
        mesin: ticketObj.mesin,
        Minggu_ke: weekNumber,
        bulan: createdAt.toLocaleString("en-US", { month: "long" }),
        jumlah_tiket: 0,
        total_waktu_menit: 0,
        tickets: [],
      };
    }

    groupedData[key].jumlah_tiket += 1;
    groupedData[key].total_waktu_menit += timeDiffMinutes;
    groupedData[key].tickets.push(ticketObj);
  });

  // Ubah data yang dikelompokkan ke format yang diinginkan
  const result = Object.values(groupedData).map((group) => {
    return {
      mesin: group.mesin,
      Minggu_ke: group.Minggu_ke,
      bulan: group.bulan,
      jumlah_tiket: group.jumlah_tiket,
      jumlah_waktu_menit: group.total_waktu_menit,
      rata_rata_waktu_menit: group.total_waktu_menit / group.jumlah_tiket,
    };
  });

  // Urutkan hasil berdasarkan mesin dan minggu
  result.sort((a, b) => {
    if (a.mesin === b.mesin) {
      return a.Minggu_ke - b.Minggu_ke;
    }
    return a.mesin.localeCompare(b.mesin);
  });

  return result;
}

// Fungsi untuk menghitung breakdown time dari data mentah
function calculateComplexBreakdownTime(ticketData) {
  // Object untuk mengelompokkan data
  const groupedData = {};

  ticketData.forEach((ticket) => {
    // Ekstrak data dari ticket
    const mesin = ticket.mesin;
    const createdAt = new Date(ticket.createdAt);
    const year = createdAt.getFullYear();
    const month = createdAt.getMonth() + 1;
    const monthName = createdAt.toLocaleString("en-US", { month: "long" });

    // Buat key untuk pengelompokan
    const key = `${mesin}_${year}_${month}`;

    // Hitung waktu dalam menit
    const waktuSelesai = new Date(ticket.waktu_selesai);
    const totalTimeDiffMinutes = (waktuSelesai - createdAt) / (1000 * 60);

    // Hitung waktu mtc dalam menit jika data tersedia
    let mtcTimeDiffMinutes = 0;
    if (ticket.waktu_respon_qc && ticket.waktu_selesai_mtc) {
      const waktuResponQc = new Date(ticket.waktu_respon_qc);
      const waktuSelesaiMtc = new Date(ticket.waktu_selesai_mtc);
      mtcTimeDiffMinutes = (waktuSelesaiMtc - waktuResponQc) / (1000 * 60);
    }

    // Buat atau update grup data
    if (!groupedData[key]) {
      groupedData[key] = {
        mesin: mesin,
        year: year,
        month: month,
        bulan: monthName,
        jumlah_tiket: 0,
        total_waktu_menit: 0,
        total_waktu_menit_mtc: 0,
        details: [],
      };
    }

    // Tambahkan data ke grup
    groupedData[key].jumlah_tiket += 1;
    groupedData[key].total_waktu_menit += totalTimeDiffMinutes;
    groupedData[key].total_waktu_menit_mtc += mtcTimeDiffMinutes;

    // Buat detail untuk ticket ini
    const detailItem = {
      operator: ticket.operator || "",
      eksekutor:
        ticket.ProsesMtcs &&
        ticket.ProsesMtcs.length > 0 &&
        ticket.ProsesMtcs[0].user_eksekutor
          ? ticket.ProsesMtcs[0].user_eksekutor.nama
          : "",
      verifikator:
        ticket.ProsesMtcs &&
        ticket.ProsesMtcs.length > 0 &&
        ticket.ProsesMtcs[0].user_qc
          ? ticket.ProsesMtcs[0].user_qc.nama
          : "",
      no_jo: ticket.no_jo || "",
      kode_lkh: ticket.kode_lkh || "",
      nama_kendala: ticket.nama_kendala || "",
      createdAt: ticket.createdAt,
      waktu_selesai: ticket.waktu_selesai,
    };

    groupedData[key].details.push(detailItem);
  });

  // Konversi ke format akhir
  const result = Object.values(groupedData).map((group) => {
    return {
      mesin: group.mesin,
      month: group.month,
      year: group.year,
      bulan: group.bulan,
      jumlah_tiket: group.jumlah_tiket,
      jumlah_waktu_menit: group.total_waktu_menit,
      jumlah_waktu_menit_mtc: group.total_waktu_menit_mtc,
      rata_rata_waktu_menit: group.total_waktu_menit / group.jumlah_tiket,
      rata_rata_waktu_menit_mtc:
        group.total_waktu_menit_mtc / group.jumlah_tiket,
      details: JSON.stringify(group.details),
    };
  });

  // Urutkan hasil berdasarkan mesin
  result.sort((a, b) => a.mesin.localeCompare(b.mesin));

  return result;
}

module.exports = ReportMaintenance;
