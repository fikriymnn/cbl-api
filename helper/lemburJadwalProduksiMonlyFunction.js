const { Op } = require("sequelize");
const JadwalProduksi = require("../model/ppic/jadwalProduksi/jadwalProduksiModel");
const masterShift = require("../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../model/masterData/hr/masterShift/masterIstirahatModel");
const JadwalKaryawan = require("../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const db = require("../config/database");
const moment = require("moment-timezone");

const lemburFunction = {
  changeLemburMonly: async (data_jadwal, list_lembur, _id, is_move = false) => {
    const t = await db.transaction();
    try {
      // Cari data yang akan diubah berdasarkan ID
      const dataToUpdate = await JadwalProduksi.findByPk(_id);

      // BUG FIX #1: res tidak tersedia di helper — gunakan throw Error
      if (!dataToUpdate) {
        throw new Error("Data tidak ditemukan.");
      }

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      oneYearFromNow.setHours(23, 59, 59, 999);

      const dataJadwalKaryawan = await JadwalKaryawan.findAll({
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
      dataJadwalKaryawan.map((jadwal) => {
        const date = new Date(jadwal.tanggal);
        const formattedDate = date.toISOString().slice(0, 10);
        jadwalLibur.push(formattedDate);
      });

      const jadwalLiburSet = new Set(
        jadwalLibur.map((date) => new Date(date).toISOString().split("T")[0]),
      );

      const lastTanggal = new Date(dataToUpdate.tanggal);
      const lastDate = lastTanggal.toISOString().split("T")[0];

      const newTanggal = new Date(data_jadwal.tanggal);
      const newDate = newTanggal.toISOString().split("T")[0];

      const originalDateTime = moment.utc(`${lastDate}T${dataToUpdate.jam}`);
      const newDateTime = moment.utc(`${newDate}T${data_jadwal.jam}`);

      // Ambil semua data berikutnya berdasarkan tanggal dan jam
      let subsequentData = [];

      if (is_move === false) {
        const dataJadwalAll = await JadwalProduksi.findAll({
          where: {
            [Op.or]: [
              {
                tanggal: {
                  [Op.gt]: dataToUpdate.tanggal,
                },
              },
              {
                tanggal: dataToUpdate.tanggal,
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

        const dataJadwalSort = dataJadwalAll.sort((a, b) => {
          const dateTimeA = new Date(
            new Date(a.tanggal).toISOString().split("T")[0] + "T" + a.jam,
          );
          const dateTimeB = new Date(
            new Date(b.tanggal).toISOString().split("T")[0] + "T" + b.jam,
          );
          return dateTimeA - dateTimeB;
        });

        let dataJadwalFilter = [];
        if (!dataToUpdate.no_jo) {
          dataJadwalFilter = dataJadwalSort.filter(
            (data) => data.no_booking == dataToUpdate.no_booking,
          );
        } else {
          dataJadwalFilter = dataJadwalSort.filter(
            (data) => data.no_jo == dataToUpdate.no_jo,
          );
        }

        const allowedMap = new Map();
        dataJadwalFilter.forEach((item) => {
          const key = `${item.tanggal}_${item.jam}`;
          if (!allowedMap.has(key)) {
            allowedMap.set(key, new Set());
          }
          allowedMap.get(key).add(item.no_jo);
        });

        const dataJadwalFilteredByTanggal = dataJadwalAll.filter((item) => {
          const key = `${item.tanggal}_${item.jam}`;
          if (!allowedMap.has(key)) {
            return true;
          }
          return allowedMap.get(key).has(item.no_jo);
        });

        subsequentData = dataJadwalFilteredByTanggal;
      } else {
        if (!dataToUpdate.no_jo) {
          subsequentData = await JadwalProduksi.findAll({
            where: {
              no_booking: dataToUpdate.no_booking,
              mesin: dataToUpdate.mesin,
              [Op.or]: [
                {
                  tanggal: {
                    [Op.gt]: dataToUpdate.tanggal,
                  },
                },
                {
                  tanggal: dataToUpdate.tanggal,
                  jam: {
                    [Op.gt]: dataToUpdate.jam,
                  },
                },
              ],
            },
            order: [
              ["tanggal", "ASC"],
              ["jam", "ASC"],
            ],
          });
        } else {
          subsequentData = await JadwalProduksi.findAll({
            where: {
              no_jo: dataToUpdate.no_jo,
              mesin: dataToUpdate.mesin,
              [Op.or]: [
                {
                  tanggal: {
                    [Op.gt]: dataToUpdate.tanggal,
                  },
                },
                {
                  tanggal: dataToUpdate.tanggal,
                  jam: {
                    [Op.gt]: dataToUpdate.jam,
                  },
                },
              ],
            },
            order: [
              ["tanggal", "ASC"],
              ["jam", "ASC"],
            ],
          });
        }
      }

      // Helper: mendapatkan hari dari tanggal
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

      // Helper: apakah tanggal adalah hari libur
      const isHoliday = (date) => {
        return jadwalLiburSet.has(date);
      };

      // BUG FIX #7: isOvertimeDay menggunakan batas shift konsisten (Shift1: 08-19, Shift2: 20-07)
      const isOvertimeDay = (date, time = null, shiftNum = null) => {
        if (!list_lembur || list_lembur.length === 0) return false;

        const formattedDate = new Date(date).toISOString().split("T")[0];

        const overtimeEntry = list_lembur.find((item) => {
          const formattedOvertimeDate = new Date(item.tanggal_lembur)
            .toISOString()
            .split("T")[0];
          return formattedDate === formattedOvertimeDate;
        });

        if (overtimeEntry) {
          if (shiftNum !== null) {
            return shiftNum === 1
              ? overtimeEntry.shift_1
              : overtimeEntry.shift_2;
          }

          if (time) {
            const hourOfDay = parseInt(time.split(":")[0], 10);
            // Shift 1: 08:00 - 19:59
            if (hourOfDay >= 8 && hourOfDay < 20) {
              return overtimeEntry.shift_1;
            }
            // Shift 2: 20:00 - 07:59 (melewati tengah malam)
            else if (hourOfDay >= 20 || hourOfDay < 8) {
              if (hourOfDay < 8) {
                const prevDate = moment(date)
                  .subtract(1, "days")
                  .format("YYYY-MM-DD");
                const prevOvertimeEntry = list_lembur.find((item) => {
                  return (
                    new Date(item.tanggal_lembur)
                      .toISOString()
                      .split("T")[0] === prevDate
                  );
                });
                return prevOvertimeEntry ? prevOvertimeEntry.shift_2 : false;
              }
              return overtimeEntry.shift_2;
            }
          }

          return overtimeEntry.shift_1 || overtimeEntry.shift_2;
        }

        // Cek apakah ini adalah early morning dari hari lembur shift 2 sebelumnya
        if (time) {
          const hourOfDay = parseInt(time.split(":")[0], 10);
          if (hourOfDay < 8) {
            const prevDate = moment(date)
              .subtract(1, "days")
              .format("YYYY-MM-DD");
            const prevOvertimeEntry = list_lembur.find((item) => {
              return (
                new Date(item.tanggal_lembur).toISOString().split("T")[0] ===
                prevDate
              );
            });
            if (prevOvertimeEntry && prevOvertimeEntry.shift_2) {
              return true;
            }
          }
        }

        return false;
      };

      // Helper: informasi shift berdasarkan hari
      const getShiftInfo = (day) => {
        return dataShift.find((shift) => shift.hari === day) || null;
      };

      // Helper: apakah waktu dalam jam istirahat
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
            const duration = breakEndMinutes - breakStartMinutes;
            let endTime = moment(breakTime.sampai, "HH:mm:ss");
            const minutes = endTime.minutes();
            const remainder = minutes % roundToMinutes;

            if (remainder !== 0) {
              endTime = endTime.add(roundToMinutes - remainder, "minutes");
            }
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

      // Helper: apakah waktu dalam jam kerja shift
      const isWorkingHour = (dateTime, shiftInfo) => {
        if (!shiftInfo) return { isWorking: false };

        const time = dateTime.format("HH:mm:ss");
        const date = dateTime.format("YYYY-MM-DD");
        const hourOfDay = parseInt(time.split(":")[0], 10);

        // BUG FIX #7: Batas shift konsisten dengan isOvertimeDay (Shift1: 08-19, Shift2: 20-07)
        if (isOvertimeDay(date, time)) {
          if (hourOfDay >= 8 && hourOfDay < 20) {
            if (isOvertimeDay(date, time, 1)) {
              return { isWorking: true, shift: 1, isOvertimeShift: true };
            }
          } else if (hourOfDay >= 20 || hourOfDay < 8) {
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
              if (isOvertimeDay(date, time, 2)) {
                return { isWorking: true, shift: 2, isOvertimeShift: true };
              }
            }
          }
        }

        const prevDate = moment(date).subtract(1, "days").format("YYYY-MM-DD");
        const prevDay = getDayOfWeek(prevDate);
        const prevShiftInfo = getShiftInfo(prevDay);
        const isPrevDayShift2Overtime = isOvertimeDay(prevDate, "23:59:59", 2);

        if (
          shiftInfo.shift_1_masuk &&
          shiftInfo.shift_1_keluar &&
          time >= shiftInfo.shift_1_masuk &&
          time <= shiftInfo.shift_1_keluar
        ) {
          return { isWorking: true, shift: 1 };
        }

        if (
          shiftInfo.shift_2_masuk &&
          shiftInfo.shift_2_keluar &&
          time >= shiftInfo.shift_2_masuk
        ) {
          if (shiftInfo.shift_2_keluar < shiftInfo.shift_2_masuk) {
            return { isWorking: true, shift: 2 };
          } else if (time <= shiftInfo.shift_2_keluar) {
            return { isWorking: true, shift: 2 };
          }
        }

        if (
          prevShiftInfo &&
          prevShiftInfo.shift_2_masuk &&
          prevShiftInfo.shift_2_keluar &&
          prevShiftInfo.shift_2_keluar < prevShiftInfo.shift_2_masuk &&
          time <= prevShiftInfo.shift_2_keluar
        ) {
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

      // BUG FIX #5: findNextValidTime dengan loopSafety untuk mencegah infinite loop
      const findNextValidTime = (currentDate) => {
        const date = currentDate;
        const day = getDayOfWeek(date);
        const shiftInfo = getShiftInfo(day);

        if (isOvertimeDay(date, "20:00:00", 2)) {
          return moment(`${date}T20:00:00`);
        }

        if (shiftInfo && shiftInfo.shift_2_masuk) {
          return moment(`${date}T${shiftInfo.shift_2_masuk}`);
        }

        const nextDate = moment(date).add(1, "days");
        const nextDayDate = nextDate.format("YYYY-MM-DD");

        if (isOvertimeDay(nextDayDate, "08:00:00", 1)) {
          return moment(`${nextDayDate}T08:00:00`);
        }

        if (!isHoliday(nextDayDate)) {
          const nextDay = getDayOfWeek(nextDayDate);
          const nextShiftInfo = getShiftInfo(nextDay);
          if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
            return moment(`${nextDayDate}T${nextShiftInfo.shift_1_masuk}`);
          }
        }

        // BUG FIX #5: Tambahkan loopSafety agar tidak infinite loop
        let searchDate = moment(nextDate);
        let safetyCounter = 0;

        while (safetyCounter < 365) {
          safetyCounter++;
          const searchDayDate = searchDate.format("YYYY-MM-DD");

          if (isOvertimeDay(searchDayDate, "00:00:00", 1)) {
            return moment(`${searchDayDate}T00:00:00`);
          }
          if (isOvertimeDay(searchDayDate, "12:00:00", 2)) {
            return moment(`${searchDayDate}T12:00:00`);
          }
          if (!isHoliday(searchDayDate)) {
            const searchDay = getDayOfWeek(searchDayDate);
            const searchShiftInfo = getShiftInfo(searchDay);
            if (searchShiftInfo && searchShiftInfo.shift_1_masuk) {
              return moment(
                `${searchDayDate}T${searchShiftInfo.shift_1_masuk}`,
              );
            }
          }

          searchDate.add(1, "days");
        }

        // Fallback jika tidak ditemukan dalam 365 hari
        throw new Error(
          "Tidak dapat menemukan waktu kerja valid dalam 365 hari ke depan.",
        );
      };

      const getNextValidDateTime = (currentDateTime, intervalInMinutes) => {
        let nextDateTime = moment(currentDateTime).add(
          intervalInMinutes,
          "minutes",
        );
        let loopSafety = 0;

        while (loopSafety < 1000) {
          loopSafety++;

          const date = nextDateTime.format("YYYY-MM-DD");
          const time = nextDateTime.format("HH:mm:ss");
          const day = getDayOfWeek(date);
          const hourOfDay = parseInt(time.split(":")[0], 10);

          const isCurrentTimeOvertime = isOvertimeDay(date, time);

          if (isCurrentTimeOvertime) {
            const overtimeShiftInfo = getShiftInfo(day);
            if (overtimeShiftInfo) {
              const breakCheck = isBreakTime(time, overtimeShiftInfo.istirahat);
              if (breakCheck.isBreak) {
                nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
                continue;
              }
            }

            // Overnight hours handling (20:00-07:59) for shift 2 overtime
            if (hourOfDay >= 20 || hourOfDay < 8) {
              if (
                isOvertimeDay(date, time, 2) ||
                (hourOfDay < 8 &&
                  isOvertimeDay(
                    moment(date).subtract(1, "days").format("YYYY-MM-DD"),
                    "23:59:59",
                    2,
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

            // Transisi shift 1 ke shift 2 pada hari lembur
            if (hourOfDay === 19 && parseInt(time.split(":")[1], 10) >= 59) {
              if (isOvertimeDay(date, "20:00:00", 2)) {
                nextDateTime = moment(`${date}T20:00:00`);
                continue;
              } else {
                nextDateTime = findNextValidTime(date);
                continue;
              }
            }
          }

          const shiftInfo = getShiftInfo(day);

          const nextDate = moment(date).add(1, "days");
          const nextDayDate = nextDate.format("YYYY-MM-DD");
          const nextDay = getDayOfWeek(nextDayDate);
          const isNextDayHoliday = isHoliday(nextDayDate);
          const isNextDayShift1Overtime = isOvertimeDay(
            nextDayDate,
            "00:00:00",
            1,
          );
          const isNextDayShift2Overtime = isOvertimeDay(
            nextDayDate,
            "12:00:00",
            2,
          );

          if (
            shiftInfo &&
            shiftInfo.shift_2_masuk &&
            shiftInfo.shift_2_keluar &&
            (isNextDayHoliday ||
              isNextDayShift1Overtime ||
              isNextDayShift2Overtime)
          ) {
            const isShift2 =
              time >= shiftInfo.shift_2_masuk ||
              (shiftInfo.shift_2_keluar < shiftInfo.shift_2_masuk &&
                time <= shiftInfo.shift_2_keluar);

            if (isShift2) {
              const workingHourCheck = isWorkingHour(nextDateTime, shiftInfo);
              if (workingHourCheck.isWorking && workingHourCheck.shift === 2) {
                const breakCheck = isBreakTime(time, shiftInfo.istirahat);
                if (breakCheck.isBreak) {
                  nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
                  continue;
                }
                break;
              }
            }
          }

          if (isHoliday(date)) {
            const prevDate = moment(date).subtract(1, "days");
            const prevDayDate = prevDate.format("YYYY-MM-DD");
            const prevDay = getDayOfWeek(prevDayDate);
            const prevShiftInfo = getShiftInfo(prevDay);
            const isPrevDayShift2Overtime = isOvertimeDay(
              prevDayDate,
              "23:59:59",
              2,
            );

            if (isPrevDayShift2Overtime && hourOfDay < 8) {
              break;
            }

            if (
              prevShiftInfo &&
              prevShiftInfo.shift_2_masuk &&
              prevShiftInfo.shift_2_keluar &&
              prevShiftInfo.shift_2_keluar < prevShiftInfo.shift_2_masuk &&
              time <= prevShiftInfo.shift_2_keluar
            ) {
              const breakCheck = isBreakTime(time, prevShiftInfo.istirahat);
              if (breakCheck.isBreak) {
                nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
                continue;
              }
              break;
            }

            let nextWorkingDate = moment(date).add(1, "days");
            let nextWorkDayDate = nextWorkingDate.format("YYYY-MM-DD");
            let nextWorkDay = getDayOfWeek(nextWorkDayDate);

            while (
              isHoliday(nextWorkDayDate) &&
              !isOvertimeDay(nextWorkDayDate, "00:00:00", 1) &&
              !isOvertimeDay(nextWorkDayDate, "12:00:00", 2)
            ) {
              nextWorkingDate.add(1, "days");
              nextWorkDayDate = nextWorkingDate.format("YYYY-MM-DD");
              nextWorkDay = getDayOfWeek(nextWorkDayDate);
            }

            if (isOvertimeDay(nextWorkDayDate, "00:00:00", 1)) {
              nextDateTime = moment(`${nextWorkDayDate}T00:00:00`);
              continue;
            }
            if (isOvertimeDay(nextWorkDayDate, "12:00:00", 2)) {
              nextDateTime = moment(`${nextWorkDayDate}T12:00:00`);
              continue;
            }

            const nextShiftInfo = getShiftInfo(nextWorkDay);
            if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${nextWorkDayDate}T${nextShiftInfo.shift_1_masuk}`,
              );
              continue;
            }
          }

          if (!shiftInfo) {
            nextDateTime = moment(date)
              .add(1, "days")
              .set({ hour: 8, minute: 0, second: 0 });
            continue;
          }

          const breakCheck = isBreakTime(time, shiftInfo.istirahat);
          if (breakCheck.isBreak) {
            nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
            continue;
          }

          const workingHourCheck = isWorkingHour(nextDateTime, shiftInfo);

          if (!workingHourCheck.isWorking) {
            if (shiftInfo.shift_1_masuk && time < shiftInfo.shift_1_masuk) {
              nextDateTime = moment(`${date}T${shiftInfo.shift_1_masuk}`);
              continue;
            }

            if (
              shiftInfo.shift_1_keluar &&
              shiftInfo.shift_2_masuk &&
              time > shiftInfo.shift_1_keluar &&
              time < shiftInfo.shift_2_masuk
            ) {
              nextDateTime = moment(`${date}T${shiftInfo.shift_2_masuk}`);
              continue;
            }

            const nextDateInner = moment(date).add(1, "days");
            const nextDayDateInner = nextDateInner.format("YYYY-MM-DD");
            const isNextShift1Overtime = isOvertimeDay(
              nextDayDateInner,
              "00:00:00",
              1,
            );
            const isNextShift2Overtime = isOvertimeDay(
              nextDayDateInner,
              "12:00:00",
              2,
            );

            if (isNextShift1Overtime) {
              nextDateTime = moment(`${nextDayDateInner}T00:00:00`);
              continue;
            }
            if (isNextShift2Overtime) {
              nextDateTime = moment(`${nextDayDateInner}T12:00:00`);
              continue;
            }

            const nextDayInner = getDayOfWeek(nextDayDateInner);

            if (!isHoliday(nextDayDateInner)) {
              const nextShiftInfo = getShiftInfo(nextDayInner);
              if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
                nextDateTime = moment(
                  `${nextDayDateInner}T${nextShiftInfo.shift_1_masuk}`,
                );
                continue;
              }
            }

            let validWorkDate = moment(nextDateInner);
            let validWorkDayDate = validWorkDate.format("YYYY-MM-DD");
            let validWorkDay = nextDayInner;

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

            if (isOvertimeDay(validWorkDayDate, "00:00:00", 1)) {
              nextDateTime = moment(`${validWorkDayDate}T00:00:00`);
              continue;
            }
            if (isOvertimeDay(validWorkDayDate, "12:00:00", 2)) {
              nextDateTime = moment(`${validWorkDayDate}T12:00:00`);
              continue;
            }

            const validShiftInfo = getShiftInfo(validWorkDay);
            if (validShiftInfo && validShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${validWorkDayDate}T${validShiftInfo.shift_1_masuk}`,
              );
              continue;
            }
          }

          break;
        }

        // BUG FIX #5: Log warning jika loopSafety tercapai
        if (loopSafety >= 1000) {
          console.warn(
            "[getNextValidDateTime] Loop safety limit reached. Returning best estimate.",
          );
        }

        return nextDateTime;
      };

      // Update data berikutnya
      let updatedDateTime = newDateTime;
      const normalInterval = 60;
      const overtimeInterval = 60;

      // BUG FIX #9: Update data utama (_id) SEBELUM subsequentData
      // agar query subsequentData mengambil data yang benar
      await JadwalProduksi.update(
        { tanggal: data_jadwal.tanggal, jam: data_jadwal.jam },
        { where: { id: _id }, transaction: t },
      );

      for (const data of subsequentData) {
        const currentDate = updatedDateTime.format("YYYY-MM-DD");
        const currentTime = updatedDateTime.format("HH:mm:ss");
        const hourOfDay = parseInt(currentTime.split(":")[0], 10);
        // BUG FIX #7: Gunakan batas shift konsisten (Shift1: 08-19, Shift2: 20-07)
        const currentShift = hourOfDay >= 8 && hourOfDay < 20 ? 1 : 2;

        const isCurrentTimeOvertime = isOvertimeDay(
          currentDate,
          currentTime,
          currentShift,
        );

        const isOvernightOvertime =
          isCurrentTimeOvertime &&
          currentShift === 2 &&
          (hourOfDay >= 20 || hourOfDay < 8);

        const interval = isCurrentTimeOvertime
          ? overtimeInterval
          : normalInterval;

        if (isOvernightOvertime) {
          updatedDateTime = moment(updatedDateTime).add(interval, "minutes");

          if (updatedDateTime.format("HH:mm:ss") === "00:00:00") {
            const nextDate = moment(currentDate)
              .add(1, "days")
              .format("YYYY-MM-DD");
            updatedDateTime = moment(`${nextDate}T00:00:00`);
          }
        } else if (
          isCurrentTimeOvertime &&
          currentShift === 1 &&
          hourOfDay === 19 &&
          parseInt(currentTime.split(":")[1], 10) >= 59
        ) {
          // Transisi shift 1 ke shift 2 pada hari lembur
          if (isOvertimeDay(currentDate, "20:00:00", 2)) {
            updatedDateTime = moment(`${currentDate}T20:00:00`);
          } else {
            updatedDateTime = findNextValidTime(currentDate);
          }
        } else {
          updatedDateTime = getNextValidDateTime(updatedDateTime, interval);
        }

        const updatedDate = updatedDateTime.format("YYYY-MM-DD");
        const updatedTime = updatedDateTime.format("HH:mm:ss");

        await JadwalProduksi.update(
          { tanggal: updatedDate, jam: updatedTime },
          { where: { id: data.id }, transaction: t },
        );
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
