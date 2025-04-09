const { Op, Sequelize } = require("sequelize");
const JadwalProduksi = require("../../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const masterShift = require("../../../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../../../model/masterData/hr/masterShift/masterIstirahatModel");
const JadwalKaryawan = require("../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const db = require("../../../config/database");
const moment = require("moment-timezone");

const jadwalProduksiViewController = {
  getJadwalProduksiView: async (req, res) => {
    try {
      const { status, start_date, end_date, mesin, page, limit, search } =
        req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      if (id) {
        const dataById = await JadwalProduksi.findByPk(id);
        res.status(200).json({ data: dataById });
      } else {
        const data = await JadwalProduksi.findAll({
          where: {
            tanggal: {
              [Op.between]: [
                new Date(start_date).setHours(0, 0, 0, 0),
                new Date(end_date).setHours(23, 59, 59, 999),
              ],
            },
          },
        });
        res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  getJadwalProduksiWeeklyView: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      const data = await JadwalProduksi.findAll({
        group: ["no_jo", "tanggal", "mesin"],
        where: {
          tanggal: {
            [Op.between]: [
              new Date(start_date).setHours(0, 0, 0, 0),
              new Date(end_date).setHours(23, 59, 59, 999),
            ],
          },
        },
      });
      res.status(200).json({ data: data });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createJadwalProduksiView: async (req, res) => {
    const t = await db.transaction();
    try {
      const data = await JadwalProduksi.bulkCreate(dataDumy, {
        transaction: t,
      });
      await t.commit();
      res.status(200).json({ msg: "create success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  updateJadwalProduksiView: async (req, res) => {
    const _id = req.params.id;
    const { data_jadwal } = req.body;
    const t = await db.transaction();
    try {
      // Cari data yang akan diubah berdasarkan ID
      const dataToUpdate = await JadwalProduksi.findByPk(_id);

      if (!dataToUpdate) {
        return { message: "Data tidak ditemukan." };
      }

      const lastTanggal = new Date(dataToUpdate.tanggal);
      const lastDate = lastTanggal.toISOString().split("T")[0];

      const newTanggal = new Date(data_jadwal.tanggal);
      const newDate = newTanggal.toISOString().split("T")[0];

      // Menggunakan moment untuk mengonversi waktu ke zona waktu lokal dan UTC
      const originalDateTime = moment.utc(`${lastDate}T${dataToUpdate.jam}`);
      const newDateTime = moment.utc(`${newDate}T${data_jadwal.jam}`);

      // Menghitung selisih waktu dalam milidetik
      const timeDifference = newDateTime.diff(originalDateTime);

      //console.log(originalDateTime);

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
          mesin: data_jadwal.mesin,
        },
        order: [
          ["tanggal", "ASC"],
          ["jam", "ASC"],
        ],
      });

      // Update data berikutnya sesuai dengan selisih waktu dan pertahankan interval antar data
      let lastUpdatedDateTime = newDateTime;

      for (const data of subsequentData) {
        const lastTanggal = new Date(data.tanggal);
        const lastDate = lastTanggal.toISOString().split("T")[0];

        const currentDateTime = moment.utc(`${lastDate}T${data.jam}`);

        // Tambahkan selisih waktu ke data berikutnya
        const updatedDateTime = moment(currentDateTime).add(
          timeDifference,
          "milliseconds"
        );

        // Perbarui tanggal dan jam dengan format yang benar
        const updatedDate = updatedDateTime.toISOString().split("T")[0];
        const updatedTime = updatedDateTime
          .toISOString()
          .split("T")[1]
          .split(".")[0];

        await JadwalProduksi.update(
          {
            tanggal: updatedDate,
            jam: updatedTime,
          },
          { where: { id: data.id }, transaction: t }
        );

        // Perbarui waktu untuk data selanjutnya
        lastUpdatedDateTime = updatedDateTime;
      }
      await t.commit();

      res.status(200).json({ msg: "update success" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  changeLemburJadwalProduksiView: async (req, res) => {
    const _id = req.params.id;
    const { data_jadwal, mesin, tgl_lembur } = req.body;

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

      // Modified helper function untuk memeriksa apakah tanggal adalah hari lembur
      const isOvertimeDay = (date, time = null) => {
        if (!tgl_lembur) return false;

        // Konversi date ke format YYYY-MM-DD untuk perbandingan
        const formattedDate = new Date(date).toISOString().split("T")[0];
        const formattedOvertimeDate = new Date(tgl_lembur)
          .toISOString()
          .split("T")[0];

        // Check if this is the overtime day
        if (formattedDate === formattedOvertimeDate) {
          return true;
        }

        // Check if this is early morning hours (00:00-04:00) of the day after overtime
        if (time) {
          const hourOfDay = parseInt(time.split(":")[0], 10);

          // If it's between midnight and 4 AM
          if (hourOfDay < 4) {
            // Check if previous day was the overtime day
            const prevDate = moment(date)
              .subtract(1, "days")
              .format("YYYY-MM-DD");
            const formattedPrevDate = new Date(prevDate)
              .toISOString()
              .split("T")[0];

            if (formattedPrevDate === formattedOvertimeDate) {
              return true; // This is the continuation of overtime into early morning
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
      const isBreakTime = (time, breakTimes) => {
        if (!breakTimes || breakTimes.length === 0) return false;

        const timeInMinutes = moment.duration(time).asMinutes();

        for (const breakTime of breakTimes) {
          const breakStartMinutes = moment.duration(breakTime.dari).asMinutes();
          const breakEndMinutes = moment.duration(breakTime.sampai).asMinutes();

          if (
            timeInMinutes >= breakStartMinutes &&
            timeInMinutes < breakEndMinutes
          ) {
            return {
              isBreak: true,
              breakEndTime: breakTime.sampai,
              breakDuration: breakEndMinutes - breakStartMinutes,
            };
          }
        }

        return { isBreak: false };
      };

      // Helper function untuk memeriksa apakah waktu berada dalam jam kerja shift
      // Modifikasi untuk menangani jam lembur (24 jam) dengan menyertakan overnight
      const isWorkingHour = (dateTime, shiftInfo) => {
        if (!shiftInfo) return { isWorking: false };

        const time = dateTime.format("HH:mm:ss");
        const date = dateTime.format("YYYY-MM-DD");

        // Jika hari ini adalah hari lembur, tentukan shift berdasarkan jam
        if (isOvertimeDay(date, time)) {
          // Untuk lembur, kita menentukan shift berdasarkan jam:
          // - Shift 1: 00:00:00 - 11:59:59
          // - Shift 2: 12:00:00 - 23:59:59
          const hourOfDay = parseInt(time.split(":")[0], 10);
          if (hourOfDay < 12) {
            return { isWorking: true, shift: 1, isOvertimeShift: true };
          } else {
            return { isWorking: true, shift: 2, isOvertimeShift: true };
          }
        }

        // Dapatkan hari sebelumnya untuk mengecek shift yang melewati tengah malam
        const prevDate = moment(date).subtract(1, "days").format("YYYY-MM-DD");
        const prevDay = getDayOfWeek(prevDate);
        const prevShiftInfo = getShiftInfo(prevDay);

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
          return { isWorking: true, shift: 2, isPrevDayShift: true };
        }

        return { isWorking: false };
      };

      // Ubah fungsi getNextValidDateTime untuk menangani hari lembur (24 jam)
      // termasuk periode 18:00-04:00
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

          // Cek jika hari ini adalah hari lembur (24 jam) termasuk early morning
          if (isOvertimeDay(date, time)) {
            // Special handling for overnight hours (18:00-04:00)
            if (hourOfDay >= 18 || hourOfDay < 4) {
              // During overnight hours of overtime, just return the time with interval
              return nextDateTime;
            }

            // Pada hari lembur, semua waktu valid kecuali waktu istirahat
            const shiftInfo = getShiftInfo(day);
            if (shiftInfo && shiftInfo.istirahat) {
              const breakCheck = isBreakTime(time, shiftInfo.istirahat);
              if (breakCheck.isBreak) {
                // Lewati waktu istirahat
                nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
                continue;
              }
            }

            // Handle transition between shifts on overtime day
            if (hourOfDay === 11 && parseInt(time.split(":")[1], 10) >= 59) {
              nextDateTime = moment(`${date}T12:00:00`);
              continue;
            }

            // Jika bukan jam istirahat, waktu valid untuk lembur
            break;
          }

          // Dapatkan data shift untuk hari ini
          const shiftInfo = getShiftInfo(day);

          // Dapatkan data untuk hari berikutnya untuk memeriksa apakah itu hari libur
          const nextDate = moment(date).add(1, "days");
          const nextDay = getDayOfWeek(nextDate.format("YYYY-MM-DD"));
          const isNextDayHoliday = isHoliday(nextDate.format("YYYY-MM-DD"));
          const isNextDayOvertime = isOvertimeDay(
            nextDate.format("YYYY-MM-DD")
          );

          // Cek jika waktu saat ini masih dalam shift 2 dan hari berikutnya adalah hari libur
          // atau hari lembur, pastikan shift 2 menyelesaikan jadwalnya
          if (
            shiftInfo &&
            shiftInfo.shift_2_masuk &&
            shiftInfo.shift_2_keluar &&
            (isNextDayHoliday || isNextDayOvertime)
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
            const prevDay = getDayOfWeek(prevDate.format("YYYY-MM-DD"));
            const prevShiftInfo = getShiftInfo(prevDay);
            const isPrevDayOvertime = isOvertimeDay(
              prevDate.format("YYYY-MM-DD")
            );

            // Check if previous day was overtime and this is early morning
            if (isPrevDayOvertime && hourOfDay < 4) {
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

            // Jika tidak ada shift yang berlanjut, lompat ke hari kerja berikutnya
            let nextWorkingDate = moment(date).add(1, "days");
            let nextWorkDay = getDayOfWeek(
              nextWorkingDate.format("YYYY-MM-DD")
            );

            // Terus geser sampai menemukan hari kerja atau hari lembur
            while (
              isHoliday(nextWorkingDate.format("YYYY-MM-DD")) &&
              !isOvertimeDay(nextWorkingDate.format("YYYY-MM-DD"))
            ) {
              nextWorkingDate.add(1, "days");
              nextWorkDay = getDayOfWeek(nextWorkingDate.format("YYYY-MM-DD"));
            }

            // Jika hari berikutnya adalah hari lembur, gunakan jam pertama hari tersebut
            if (isOvertimeDay(nextWorkingDate.format("YYYY-MM-DD"))) {
              nextDateTime = moment(
                `${nextWorkingDate.format("YYYY-MM-DD")}T00:00:00`
              );
              continue;
            }

            // Jika bukan hari lembur, gunakan shift 1 hari kerja tersebut
            const nextShiftInfo = getShiftInfo(nextWorkDay);
            if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${nextWorkingDate.format("YYYY-MM-DD")}T${
                  nextShiftInfo.shift_1_masuk
                }`
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

            // Cek apakah hari besok adalah hari lembur
            const nextDate = moment(date).add(1, "days");
            const nextDayDate = nextDate.format("YYYY-MM-DD");

            if (isOvertimeDay(nextDayDate)) {
              // Jika besok hari lembur, mulai jam 00:00
              nextDateTime = moment(`${nextDayDate}T00:00:00`);
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
            let validWorkDay = nextDay;

            while (
              isHoliday(validWorkDate.format("YYYY-MM-DD")) &&
              !isOvertimeDay(validWorkDate.format("YYYY-MM-DD")) &&
              !getShiftInfo(validWorkDay)
            ) {
              validWorkDate.add(1, "days");
              validWorkDay = getDayOfWeek(validWorkDate.format("YYYY-MM-DD"));
            }

            // Jika hari valid berikutnya adalah hari lembur
            if (isOvertimeDay(validWorkDate.format("YYYY-MM-DD"))) {
              nextDateTime = moment(
                `${validWorkDate.format("YYYY-MM-DD")}T00:00:00`
              );
              continue;
            }

            // Jika bukan hari lembur, pakai shift 1
            const validShiftInfo = getShiftInfo(validWorkDay);
            if (validShiftInfo && validShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${validWorkDate.format("YYYY-MM-DD")}T${
                  validShiftInfo.shift_1_masuk
                }`
              );
              continue;
            }
          }

          // Jika sudah valid, keluar dari loop
          break;
        }

        return nextDateTime;
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

        // Special handling for overnight hours during overtime
        const isOvernightOvertime =
          isOvertimeDay(currentDate, currentTime) &&
          (hourOfDay >= 18 || hourOfDay < 4);

        // Use appropriate interval
        const interval = isOvertimeDay(currentDate, currentTime)
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
          isOvertimeDay(currentDate, currentTime) &&
          hourOfDay === 11 &&
          parseInt(currentTime.split(":")[1], 10) >= 59
        ) {
          // Special case for transition from shift 1 to shift 2 on overtime days
          const shiftChangeTime = moment(`${currentDate}T12:00:00`);
          updatedDateTime = shiftChangeTime;
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

      res.status(200).json({ msg: "update success" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = jadwalProduksiViewController;
