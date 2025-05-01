const { Op, Sequelize } = require("sequelize");
const JadwalProduksi = require("../model/ppic/jadwalProduksi/jadwalProduksiModel");
const masterShift = require("../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../model/masterData/hr/masterShift/masterIstirahatModel");
const JadwalKaryawan = require("../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const db = require("../config/database");
const moment = require("moment-timezone");

const lemburFunction = {
  changeLemburMonly: async (data_jadwal, list_lembur, _id) => {
    const t = await db.transaction();
    try {
      // Cari data yang akan diubah berdasarkan ID
      const dataToUpdate = await JadwalProduksi.findByPk(_id);

      if (!dataToUpdate) {
        return res.status(404).json({ message: "Data tidak ditemukan." });
      }

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      oneYearFromNow.setHours(23, 59, 59, 999); // Akhir hari satu tahun ke depan

      const dataJadwal = await JadwalKaryawan.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          tanggal: {
            [Op.between]: [new Date().setHours(0, 0, 0, 0), oneYearFromNow],
          },
          jenis_karyawan: "produksi",
        },
      });

      const dataShift = await masterShift.findAll({
        include: [
          {
            model: masterIstirahat,
            as: "istirahat",
          },
        ],
      });

      // Jadwal libur
      let jadwalLibur = [];

      dataJadwal.map((jadwal) => {
        const date = new Date(jadwal.tanggal);
        const formattedDate = date.toISOString().slice(0, 10);
        jadwalLibur.push(formattedDate);
      });

      const jadwalLiburSet = new Set(
        jadwalLibur.map((date) => new Date(date).toISOString().split("T")[0])
      );

      const lastTanggal = new Date(dataToUpdate.tanggal);
      const lastDate = lastTanggal.toISOString().split("T")[0];

      const newTanggal = new Date(data_jadwal.tanggal);
      const newDate = newTanggal.toISOString().split("T")[0];

      // Menggunakan moment untuk mengonversi waktu ke zona waktu lokal dan UTC
      const originalDateTime = moment.utc(`${lastDate}T${dataToUpdate.jam}`);
      const newDateTime = moment.utc(`${newDate}T${data_jadwal.jam}`);

      // Menghitung selisih waktu dalam milidetik
      const timeDifference = newDateTime.diff(originalDateTime);

      // Update data yang diubah
      await JadwalProduksi.update(
        { tanggal: data_jadwal.tanggal, jam: data_jadwal.jam },
        { where: { id: _id }, transaction: t }
      );

      // Ambil semua data berikutnya berdasarkan tanggal dan jam
      const subsequentData = await JadwalProduksi.findAll({
        where: {
          [Op.or]: [
            {
              tanggal: {
                [Op.gt]: dataToUpdate.tanggal, // Tanggal lebih besar
              },
            },
            {
              tanggal: dataToUpdate.tanggal, // Tanggal sama tetapi jam lebih besar
              jam: {
                [Op.gt]: dataToUpdate.jam,
              },
            },
          ],
          mesin: dataToUpdate.mesin,
        },
        order: [
          ["tanggal", "ASC"],
          ["jam", "ASC"],
        ],
      });

      // Helper function untuk mendapatkan hari dari tanggal
      const getDayOfWeek = (date) => {
        const days = [
          "Minggu",
          "Senin",
          "Selasa",
          "Rabu",
          "Kamis",
          "Jumat",
          "Sabtu",
        ];
        return days[new Date(date).getDay()];
      };

      // Helper function untuk memeriksa apakah tanggal adalah hari libur
      const isHoliday = (date) => {
        return jadwalLiburSet.has(date);
      };

      // Modified helper function untuk memeriksa apakah tanggal dan shift adalah lembur
      const isOvertimeDay = (date, time = null, shiftNum = null) => {
        if (!list_lembur || list_lembur.length === 0) return false;

        // Konversi date ke format YYYY-MM-DD untuk perbandingan
        const formattedDate = new Date(date).toISOString().split("T")[0];

        // Find the overtime entry for this date
        const overtimeEntry = list_lembur.find((item) => {
          const formattedOvertimeDate = new Date(item.tanggal_lembur)
            .toISOString()
            .split("T")[0];
          return formattedDate === formattedOvertimeDate;
        });

        if (overtimeEntry) {
          // If shift number is provided, check if that specific shift is overtime
          if (shiftNum !== null) {
            return shiftNum === 1
              ? overtimeEntry.shift_1
              : overtimeEntry.shift_2;
          }

          // If time is provided, determine the shift based on time
          if (time) {
            const hourOfDay = parseInt(time.split(":")[0], 10);

            // Shift 1: 08:00:00 - 19:59:59
            if (hourOfDay >= 8 && hourOfDay < 20) {
              return overtimeEntry.shift_1;
            }
            // Shift 2: 20:00:00 - 23:59:59 dan 00:00:00 - 07:59:59 hari berikutnya
            else if (hourOfDay >= 20 || hourOfDay < 8) {
              // Jika waktu 00:00-06:59, periksa apakah hari sebelumnya adalah lembur shift 2
              if (hourOfDay < 8) {
                const prevDate = moment(date)
                  .subtract(1, "days")
                  .format("YYYY-MM-DD");

                const prevOvertimeEntry = list_lembur.find((item) => {
                  const formattedOvertimeDate = new Date(item.tanggal_lembur)
                    .toISOString()
                    .split("T")[0];
                  return prevDate === formattedOvertimeDate;
                });

                return prevOvertimeEntry && prevOvertimeEntry.shift_2;
              }

              return overtimeEntry.shift_2;
            }
          }

          // If no specific time or shift is provided, at least one shift is overtime
          return overtimeEntry.shift_1 || overtimeEntry.shift_2;
        }

        // Check for early morning hours (00:00-06:59) of the day after overtime
        if (time) {
          const hourOfDay = parseInt(time.split(":")[0], 10);

          // If it's between midnight and 8 AM
          if (hourOfDay < 8) {
            // Check if previous day was an overtime day for shift 2
            const prevDate = moment(date)
              .subtract(1, "days")
              .format("YYYY-MM-DD");

            const prevOvertimeEntry = list_lembur.find((item) => {
              const formattedOvertimeDate = new Date(item.tanggal_lembur)
                .toISOString()
                .split("T")[0];
              return prevDate === formattedOvertimeDate;
            });

            // Check if the previous day had shift 2 overtime
            if (prevOvertimeEntry && prevOvertimeEntry.shift_2) {
              return true; // This is the continuation of shift 2 overtime into early morning
            }
          }
        }

        return false;
      };

      // Helper function untuk mendapatkan informasi shift berdasarkan hari
      const getShiftInfo = (day) => {
        return dataShift.find((shift) => shift.hari === day) || null;
      };

      // Helper function untuk memeriksa apakah waktu tertentu berada dalam jam istirahat
      const isBreakTime = (time, breakTimes, roundToMinutes = 60) => {
        if (!breakTimes || breakTimes.length === 0) return { isBreak: false };

        const timeInMinutes = moment.duration(time).asMinutes();

        for (const breakTime of breakTimes) {
          const breakStartMinutes = moment.duration(breakTime.dari).asMinutes();
          const breakEndMinutes = moment.duration(breakTime.sampai).asMinutes();

          if (
            timeInMinutes >= breakStartMinutes &&
            timeInMinutes < breakEndMinutes
          ) {
            // Hitung durasi istirahat
            const duration = breakEndMinutes - breakStartMinutes;

            // Ambil waktu breakEnd asli sebagai moment object
            let endTime = moment(breakTime.sampai, "HH:mm:ss");

            // Bulatkan ke atas ke kelipatan roundToMinutes
            const minutes = endTime.minutes();
            const remainder = minutes % roundToMinutes;

            if (remainder !== 0) {
              const extra = roundToMinutes - remainder;
              endTime = endTime.add(extra, "minutes");
            }

            // Pastikan detik diset ke 0
            endTime.seconds(0);

            return {
              isBreak: true,
              breakEndTime: endTime.format("HH:mm:ss"),
              breakDuration: duration,
            };
          }
        }

        return { isBreak: false };
      };

      // Helper function untuk memeriksa apakah waktu berada dalam jam kerja shift
      // Modifikasi untuk menangani jam lembur dengan spesifik shift
      const isWorkingHour = (dateTime, shiftInfo) => {
        if (!shiftInfo) return { isWorking: false };

        const time = dateTime.format("HH:mm:ss");
        const date = dateTime.format("YYYY-MM-DD");
        const hourOfDay = parseInt(time.split(":")[0], 10);

        // Jika hari ini adalah hari lembur, tentukan shift berdasarkan jam
        if (isOvertimeDay(date, time)) {
          // Untuk lembur, kita menggunakan jam yang telah ditentukan:
          // - Shift 1: 08:00:00 - 19:59:59
          // - Shift 2: 20:00:00 - 06:59:59 (melewati tengah malam)
          if (hourOfDay >= 8 && hourOfDay < 20) {
            // Check if shift 1 is overtime for this date
            if (isOvertimeDay(date, time, 1)) {
              return { isWorking: true, shift: 1, isOvertimeShift: true };
            }
          } else if (hourOfDay >= 20 || hourOfDay < 8) {
            // Untuk jam 00:00-06:59, kita perlu mengecek apakah hari sebelumnya adalah lembur shift 2
            if (hourOfDay < 8) {
              const prevDate = moment(date)
                .subtract(1, "days")
                .format("YYYY-MM-DD");
              if (isOvertimeDay(prevDate, "23:59:59", 2)) {
                return {
                  isWorking: true,
                  shift: 2,
                  isOvertimeShift: true,
                  isPrevDayShift: true,
                };
              }
            } else {
              // Check if shift 2 is overtime for this date
              if (isOvertimeDay(date, time, 2)) {
                return { isWorking: true, shift: 2, isOvertimeShift: true };
              }
            }
          }
        }

        // Dapatkan hari sebelumnya untuk mengecek shift yang melewati tengah malam
        const prevDate = moment(date).subtract(1, "days").format("YYYY-MM-DD");
        const prevDay = getDayOfWeek(prevDate);
        const prevShiftInfo = getShiftInfo(prevDay);
        const isPrevDayShift2Overtime = isOvertimeDay(prevDate, "23:59:59", 2);

        // Cek shift 1
        if (
          shiftInfo.shift_1_masuk &&
          shiftInfo.shift_1_keluar &&
          time >= shiftInfo.shift_1_masuk &&
          time <= shiftInfo.shift_1_keluar
        ) {
          return { isWorking: true, shift: 1 };
        }

        // Cek shift 2 di hari ini
        if (
          shiftInfo.shift_2_masuk &&
          shiftInfo.shift_2_keluar &&
          time >= shiftInfo.shift_2_masuk
        ) {
          // Jika shift 2 keluar lebih awal dari masuk, berarti melewati tengah malam
          if (shiftInfo.shift_2_keluar < shiftInfo.shift_2_masuk) {
            return { isWorking: true, shift: 2 };
          } else if (time <= shiftInfo.shift_2_keluar) {
            return { isWorking: true, shift: 2 };
          }
        }

        // Cek apakah waktu berada di shift 2 hari sebelumnya yang melewati tengah malam
        if (
          prevShiftInfo &&
          prevShiftInfo.shift_2_masuk &&
          prevShiftInfo.shift_2_keluar &&
          prevShiftInfo.shift_2_keluar < prevShiftInfo.shift_2_masuk &&
          time <= prevShiftInfo.shift_2_keluar
        ) {
          // Check if the previous day's shift 2 was overtime
          if (isPrevDayShift2Overtime) {
            return {
              isWorking: true,
              shift: 2,
              isPrevDayShift: true,
              isOvertimeShift: true,
            };
          }
          return { isWorking: true, shift: 2, isPrevDayShift: true };
        }

        return { isWorking: false };
      };

      // Ubah fungsi getNextValidDateTime untuk menangani hari lembur dengan spesifik shift
      const getNextValidDateTime = (currentDateTime, intervalInMinutes) => {
        // Tambahkan interval waktu ke waktu saat ini
        let nextDateTime = moment(currentDateTime).add(
          intervalInMinutes,
          "minutes"
        );
        let loopSafety = 0; // Mencegah infinite loop

        while (loopSafety < 1000) {
          loopSafety++;

          const date = nextDateTime.format("YYYY-MM-DD");
          const time = nextDateTime.format("HH:mm:ss");
          const day = getDayOfWeek(date);
          const hourOfDay = parseInt(time.split(":")[0], 10);

          // Cek jika hari dan shift ini adalah lembur
          const currentShift = hourOfDay < 12 ? 1 : 2;
          // Dalam fungsi getNextValidDateTime, update bagian yang menangani lembur
          // Contoh potongan kode untuk bagian pengecekan lembur:

          // Cek jika hari dan shift ini adalah lembur
          const isCurrentTimeOvertime = isOvertimeDay(date, time);

          if (isCurrentTimeOvertime) {
            const hourOfDay = parseInt(time.split(":")[0], 10);

            const overtimeShiftInfo = getShiftInfo(day);
            if (overtimeShiftInfo) {
              const breakCheck = isBreakTime(time, overtimeShiftInfo.istirahat);
              if (breakCheck.isBreak) {
                nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
                console.log(nextDateTime);
                continue;
              }
            }

            // Overnight hours handling (20:00-06:59) for shift 2 overtime
            if (hourOfDay >= 20 || hourOfDay < 8) {
              // Check if this is shift 2 overtime
              if (
                isOvertimeDay(date, time, 2) ||
                (hourOfDay < 8 &&
                  isOvertimeDay(
                    moment(date).subtract(1, "days").format("YYYY-MM-DD"),
                    "23:59:59",
                    2
                  ))
              ) {
                return nextDateTime;
              }
            }

            // Shift 1 overtime (08:00-19:59)
            if (
              hourOfDay >= 8 &&
              hourOfDay < 20 &&
              isOvertimeDay(date, time, 1)
            ) {
              return nextDateTime;
            }

            // Handle transition between shifts on overtime day
            if (hourOfDay === 19 && parseInt(time.split(":")[1], 10) >= 59) {
              // Check if shift 2 is also overtime
              if (isOvertimeDay(date, "20:00:00", 2)) {
                nextDateTime = moment(`${date}T20:00:00`);
                continue;
              } else {
                // If shift 2 is not overtime, find next valid time
                nextDateTime = findNextValidTime(date);
                continue;
              }
            }
          }

          // Dapatkan data shift untuk hari ini
          const shiftInfo = getShiftInfo(day);

          // Dapatkan data untuk hari berikutnya untuk memeriksa apakah itu hari libur
          const nextDate = moment(date).add(1, "days");
          const nextDayDate = nextDate.format("YYYY-MM-DD");
          const nextDay = getDayOfWeek(nextDayDate);
          const isNextDayHoliday = isHoliday(nextDayDate);
          const isNextDayShift1Overtime = isOvertimeDay(
            nextDayDate,
            "00:00:00",
            1
          );
          const isNextDayShift2Overtime = isOvertimeDay(
            nextDayDate,
            "12:00:00",
            2
          );

          // Cek jika waktu saat ini masih dalam shift 2 dan hari berikutnya adalah hari libur
          // atau hari lembur, pastikan shift 2 menyelesaikan jadwalnya
          if (
            shiftInfo &&
            shiftInfo.shift_2_masuk &&
            shiftInfo.shift_2_keluar &&
            (isNextDayHoliday ||
              isNextDayShift1Overtime ||
              isNextDayShift2Overtime)
          ) {
            // Cek apakah waktu berada dalam jam kerja shift 2
            const isShift2 =
              time >= shiftInfo.shift_2_masuk ||
              (shiftInfo.shift_2_keluar < shiftInfo.shift_2_masuk &&
                time <= shiftInfo.shift_2_keluar);

            if (isShift2) {
              // Jika masih dalam shift 2 dan jam berikutnya valid, gunakan waktu itu
              const workingHourCheck = isWorkingHour(nextDateTime, shiftInfo);
              if (workingHourCheck.isWorking && workingHourCheck.shift === 2) {
                // Periksa apakah waktu berada dalam jam istirahat shift 2
                const breakCheck = isBreakTime(time, shiftInfo.istirahat);
                if (breakCheck.isBreak) {
                  nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
                  continue;
                }
                break; // Waktu valid dalam shift 2, gunakan ini
              }
            }
          }

          // Cek apakah hari libur
          if (isHoliday(date)) {
            // Periksa apakah ada shift 2 dari hari sebelumnya yang masih berlanjut
            const prevDate = moment(date).subtract(1, "days");
            const prevDayDate = prevDate.format("YYYY-MM-DD");
            const prevDay = getDayOfWeek(prevDayDate);
            const prevShiftInfo = getShiftInfo(prevDay);
            const isPrevDayShift2Overtime = isOvertimeDay(
              prevDayDate,
              "23:59:59",
              2
            );

            // Check if previous day was overtime shift 2 and this is early morning
            if (isPrevDayShift2Overtime && hourOfDay < 4) {
              // Still in overtime period, valid time
              break;
            }

            if (
              prevShiftInfo &&
              prevShiftInfo.shift_2_masuk &&
              prevShiftInfo.shift_2_keluar &&
              prevShiftInfo.shift_2_keluar < prevShiftInfo.shift_2_masuk &&
              time <= prevShiftInfo.shift_2_keluar
            ) {
              // Masih dalam shift 2 hari sebelumnya yang berlanjut ke hari libur
              // Periksa apakah berada dalam waktu istirahat
              const breakCheck = isBreakTime(time, prevShiftInfo.istirahat);
              if (breakCheck.isBreak) {
                nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
                continue;
              }
              break; // Waktu valid dalam shift 2 hari sebelumnya, gunakan ini
            }

            // Jika tidak ada shift yang berlanjut, lompat ke hari kerja atau lembur berikutnya
            let nextWorkingDate = moment(date).add(1, "days");
            let nextWorkDayDate = nextWorkingDate.format("YYYY-MM-DD");
            let nextWorkDay = getDayOfWeek(nextWorkDayDate);

            // Terus geser sampai menemukan hari kerja atau hari lembur
            while (
              isHoliday(nextWorkDayDate) &&
              !isOvertimeDay(nextWorkDayDate, "00:00:00", 1) &&
              !isOvertimeDay(nextWorkDayDate, "12:00:00", 2)
            ) {
              nextWorkingDate.add(1, "days");
              nextWorkDayDate = nextWorkingDate.format("YYYY-MM-DD");
              nextWorkDay = getDayOfWeek(nextWorkDayDate);
            }

            // Jika hari berikutnya memiliki shift 1 lembur, gunakan jam awal lembur
            if (isOvertimeDay(nextWorkDayDate, "00:00:00", 1)) {
              nextDateTime = moment(`${nextWorkDayDate}T00:00:00`);
              continue;
            }

            // Jika hari berikutnya memiliki shift 2 lembur, gunakan jam awal shift 2
            if (isOvertimeDay(nextWorkDayDate, "12:00:00", 2)) {
              nextDateTime = moment(`${nextWorkDayDate}T12:00:00`);
              continue;
            }

            // Jika bukan hari lembur, gunakan shift 1 hari kerja tersebut
            const nextShiftInfo = getShiftInfo(nextWorkDay);
            if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${nextWorkDayDate}T${nextShiftInfo.shift_1_masuk}`
              );
              continue;
            }
          }

          // Jika tidak ada informasi shift untuk hari ini
          if (!shiftInfo) {
            nextDateTime = moment(date).add(1, "days").set({
              hour: 8,
              minute: 0,
              second: 0,
            });
            continue;
          }

          // Cek apakah waktu berada dalam jam istirahat
          const breakCheck = isBreakTime(time, shiftInfo.istirahat);
          if (breakCheck.isBreak) {
            nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
            continue;
          }

          // Cek apakah waktu berada dalam jam kerja
          const workingHourCheck = isWorkingHour(nextDateTime, shiftInfo);

          if (!workingHourCheck.isWorking) {
            // Cek apakah waktu saat ini sebelum shift 1 dimulai pada hari yang sama
            if (shiftInfo.shift_1_masuk && time < shiftInfo.shift_1_masuk) {
              nextDateTime = moment(`${date}T${shiftInfo.shift_1_masuk}`);
              continue;
            }

            // Cek apakah waktu saat ini berada di antara shift 1 dan shift 2
            if (
              shiftInfo.shift_1_keluar &&
              shiftInfo.shift_2_masuk &&
              time > shiftInfo.shift_1_keluar &&
              time < shiftInfo.shift_2_masuk
            ) {
              nextDateTime = moment(`${date}T${shiftInfo.shift_2_masuk}`);
              continue;
            }

            // Jika setelah semua shift hari ini atau tidak ada shift lagi,
            // periksa apakah bisa masuk ke hari berikutnya

            // Cek kondisi lembur untuk hari berikutnya
            const nextDate = moment(date).add(1, "days");
            const nextDayDate = nextDate.format("YYYY-MM-DD");
            const isNextDayShift1Overtime = isOvertimeDay(
              nextDayDate,
              "00:00:00",
              1
            );
            const isNextDayShift2Overtime = isOvertimeDay(
              nextDayDate,
              "12:00:00",
              2
            );

            // Jika besok hari lembur shift 1, mulai jam 00:00
            if (isNextDayShift1Overtime) {
              nextDateTime = moment(`${nextDayDate}T00:00:00`);
              continue;
            }

            // Jika besok hari lembur shift 2, mulai jam 12:00
            if (isNextDayShift2Overtime) {
              nextDateTime = moment(`${nextDayDate}T12:00:00`);
              continue;
            }

            const nextDay = getDayOfWeek(nextDayDate);

            // Jika hari berikutnya bukan hari libur dan memiliki shift
            if (!isHoliday(nextDayDate)) {
              const nextShiftInfo = getShiftInfo(nextDay);

              if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
                nextDateTime = moment(
                  `${nextDayDate}T${nextShiftInfo.shift_1_masuk}`
                );
                continue;
              }
            }

            // Jika tidak bisa masuk ke hari berikutnya, cari hari kerja atau lembur terdekat
            let validWorkDate = moment(nextDate);
            let validWorkDayDate = validWorkDate.format("YYYY-MM-DD");
            let validWorkDay = nextDay;

            while (
              isHoliday(validWorkDayDate) &&
              !isOvertimeDay(validWorkDayDate, "00:00:00", 1) &&
              !isOvertimeDay(validWorkDayDate, "12:00:00", 2) &&
              !getShiftInfo(validWorkDay)
            ) {
              validWorkDate.add(1, "days");
              validWorkDayDate = validWorkDate.format("YYYY-MM-DD");
              validWorkDay = getDayOfWeek(validWorkDayDate);
            }

            // Jika hari valid berikutnya adalah hari lembur shift 1
            if (isOvertimeDay(validWorkDayDate, "00:00:00", 1)) {
              nextDateTime = moment(`${validWorkDayDate}T00:00:00`);
              continue;
            }

            // Jika hari valid berikutnya adalah hari lembur shift 2
            if (isOvertimeDay(validWorkDayDate, "12:00:00", 2)) {
              nextDateTime = moment(`${validWorkDayDate}T12:00:00`);
              continue;
            }

            // Jika bukan hari lembur, pakai shift 1
            const validShiftInfo = getShiftInfo(validWorkDay);
            if (validShiftInfo && validShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${validWorkDayDate}T${validShiftInfo.shift_1_masuk}`
              );
              continue;
            }
          }

          // Jika sudah valid, keluar dari loop
          break;
        }

        return nextDateTime;
      };

      // Fungsi helper untuk mencari waktu valid berikutnya ketika transisi shift
      const findNextValidTime = (currentDate) => {
        const date = currentDate;
        const day = getDayOfWeek(date);
        const shiftInfo = getShiftInfo(day);
        const currentHour = parseInt(moment().format("HH"), 10);

        // Cek apakah shift 2 hari ini adalah lembur
        if (isOvertimeDay(date, "20:00:00", 2)) {
          return moment(`${date}T20:00:00`);
        }

        // Cek apakah hari ini memiliki shift 2 normal
        if (shiftInfo && shiftInfo.shift_2_masuk) {
          return moment(`${date}T${shiftInfo.shift_2_masuk}`);
        }

        // Cek untuk hari berikutnya
        const nextDate = moment(date).add(1, "days");
        const nextDayDate = nextDate.format("YYYY-MM-DD");

        // Cek apakah hari berikutnya adalah hari lembur shift 1
        if (isOvertimeDay(nextDayDate, "08:00:00", 1)) {
          return moment(`${nextDayDate}T08:00:00`);
        }

        // Cek apakah hari berikutnya tidak libur dan memiliki shift 1
        if (!isHoliday(nextDayDate)) {
          const nextDay = getDayOfWeek(nextDayDate);
          const nextShiftInfo = getShiftInfo(nextDay);

          if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
            return moment(`${nextDayDate}T${nextShiftInfo.shift_1_masuk}`);
          }
        }

        // Cari hari berikutnya yang valid
        let searchDate = moment(nextDate);

        while (true) {
          const searchDayDate = searchDate.format("YYYY-MM-DD");

          // Cek apakah ini hari lembur
          if (isOvertimeDay(searchDayDate, "00:00:00", 1)) {
            return moment(`${searchDayDate}T00:00:00`);
          }

          if (isOvertimeDay(searchDayDate, "12:00:00", 2)) {
            return moment(`${searchDayDate}T12:00:00`);
          }

          // Cek apakah ini hari kerja normal
          if (!isHoliday(searchDayDate)) {
            const searchDay = getDayOfWeek(searchDayDate);
            const searchShiftInfo = getShiftInfo(searchDay);

            if (searchShiftInfo && searchShiftInfo.shift_1_masuk) {
              return moment(
                `${searchDayDate}T${searchShiftInfo.shift_1_masuk}`
              );
            }
          }

          searchDate.add(1, "days");
        }
      };

      // Update data berikutnya dengan mempertimbangkan shift, hari libur, dan hari lembur
      let updatedDateTime = newDateTime;

      // Interval waktu pada hari normal vs hari lembur
      const normalInterval = 60; // 60 menit untuk hari normal
      const overtimeInterval = 60; // 60 menit untuk hari lembur, bisa disesuaikan

      // Proses update jadwal
      for (const data of subsequentData) {
        // Debug info - uncomment if needed
        // console.log(`Processing ID ${data.id}: Current time ${updatedDateTime.format('YYYY-MM-DD HH:mm:ss')}`);

        // Mendapatkan waktu valid berikutnya
        const currentDate = updatedDateTime.format("YYYY-MM-DD");
        const currentTime = updatedDateTime.format("HH:mm:ss");
        const hourOfDay = parseInt(currentTime.split(":")[0], 10);
        const currentShift = hourOfDay < 12 ? 1 : 2;

        // Check if this time is in overtime
        const isCurrentTimeOvertime = isOvertimeDay(
          currentDate,
          currentTime,
          currentShift
        );

        // Special handling for overnight hours during shift 2 overtime
        const isOvernightOvertime =
          isCurrentTimeOvertime &&
          currentShift === 2 &&
          (hourOfDay >= 18 || hourOfDay < 4);

        // Use appropriate interval
        const interval = isCurrentTimeOvertime
          ? overtimeInterval
          : normalInterval;

        // Special case for overnight hours during overtime
        if (isOvernightOvertime) {
          // For overnight hours, just increment by interval without other checks
          updatedDateTime = moment(updatedDateTime).add(interval, "minutes");

          // Handle day transition at midnight
          if (updatedDateTime.format("HH:mm:ss") === "00:00:00") {
            // We've crossed midnight - ensure we're using the correct date
            const nextDate = moment(currentDate)
              .add(1, "days")
              .format("YYYY-MM-DD");
            updatedDateTime = moment(`${nextDate}T00:00:00`);
          }
        } else if (
          isCurrentTimeOvertime &&
          currentShift === 1 &&
          hourOfDay === 11 &&
          parseInt(currentTime.split(":")[1], 10) >= 59
        ) {
          // Special case for transition from shift 1 to shift 2 on overtime days
          // Check if shift 2 is also overtime today
          if (isOvertimeDay(currentDate, "12:00:00", 2)) {
            const shiftChangeTime = moment(`${currentDate}T12:00:00`);
            updatedDateTime = shiftChangeTime;
          } else {
            // Shift 2 is not overtime, find next valid time
            updatedDateTime = findNextValidTime(currentDate);
          }
        } else {
          // Regular scheduling with all the checks
          updatedDateTime = getNextValidDateTime(updatedDateTime, interval);
        }

        // Perbarui tanggal dan jam dengan format yang benar
        const updatedDate = updatedDateTime.format("YYYY-MM-DD");
        const updatedTime = updatedDateTime.format("HH:mm:ss");

        await JadwalProduksi.update(
          {
            tanggal: updatedDate,
            jam: updatedTime,
          },
          { where: { id: data.id }, transaction: t }
        );

        // Debug info - uncomment if needed
        // console.log(`Updated to: ${updatedDate} ${updatedTime}`);
      }

      await t.commit();

      return "update success";
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};

module.exports = lemburFunction;
