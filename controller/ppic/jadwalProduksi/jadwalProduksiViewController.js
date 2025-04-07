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

      // Helper function untuk mendapatkan informasi shift berdasarkan hari
      // const getShiftInfo = (day) => {
      //   return dataShift.find((shift) => shift.hari === day) || null;
      // };

      const lemburDate = new Date(tgl_lembur).toISOString().split("T")[0];
      // Buat salinan dataShift agar tidak mengubah data aslinya
      const adjustedShift = JSON.parse(JSON.stringify(dataShift));

      const getShiftInfo = (day, date = null) => {
        if (date === lemburDate) {
          const changeShift =
            adjustedShift.find((shift) => shift.hari === day) || null;

          return {
            ...changeShift,
            shift_1_masuk: "08:00:00",
            shift_1_keluar: "19:00:00",
            shift_2_masuk: "20:00:00",
            shift_2_keluar: "07:00:00",
          };
        }

        return adjustedShift.find((shift) => shift.hari === day) || null;
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

      // Helper function yang diperbaiki untuk memeriksa apakah waktu berada dalam jam kerja shift
      const isWorkingHour = (dateTime, shiftInfo) => {
        if (!shiftInfo) return { isWorking: false };

        const time = dateTime.format("HH:mm:ss");
        const date = dateTime.format("YYYY-MM-DD");

        // Dapatkan hari sebelumnya untuk mengecek shift yang melewati tengah malam
        const prevDate = moment(date).subtract(1, "days").format("YYYY-MM-DD");
        const prevDay = getDayOfWeek(prevDate);
        const prevShiftInfo = getShiftInfo(prevDay, prevDate);

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

      // Ubah fungsi getNextValidDateTime untuk memastikan shift 2 selesai sebelum beralih ke hari berikutnya
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

          // Dapatkan data shift untuk hari ini
          const shiftInfo = getShiftInfo(day, date);

          // Dapatkan data untuk hari berikutnya untuk memeriksa apakah itu hari libur
          const nextDate = moment(date).add(1, "days");
          const nextDay = getDayOfWeek(nextDate.format("YYYY-MM-DD"));
          const isNextDayHoliday = isHoliday(nextDate.format("YYYY-MM-DD"));
          //|| nextDay === "Minggu";

          // Cek jika waktu saat ini masih dalam shift 2 dan hari berikutnya adalah hari libur
          // Pastikan shift 2 menyelesaikan jadwalnya
          if (
            shiftInfo &&
            shiftInfo.shift_2_masuk &&
            shiftInfo.shift_2_keluar &&
            isNextDayHoliday
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

          // Cek apakah hari libur atau Minggu
          if (
            isHoliday(date)
            //|| day === "Minggu"
          ) {
            // Periksa apakah ada shift 2 dari hari sebelumnya yang masih berlanjut
            const prevDate = moment(date).subtract(1, "days");
            const prevDay = getDayOfWeek(prevDate.format("YYYY-MM-DD"));
            const prevShiftInfo = getShiftInfo(prevDay, prevDate);

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

            while (
              isHoliday(nextWorkingDate.format("YYYY-MM-DD"))
              //  ||
              // nextWorkDay === "Minggu"
            ) {
              nextWorkingDate.add(1, "days");
              nextWorkDay = getDayOfWeek(nextWorkingDate.format("YYYY-MM-DD"));
            }

            const nextShiftInfo = getShiftInfo(
              nextWorkDay,
              nextWorkingDate.format("YYYY-MM-DD")
            );

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
            // periksa apakah bisa masuk ke shift 1 hari berikutnya
            const nextDate = moment(date).add(1, "days");
            const nextDay = getDayOfWeek(nextDate.format("YYYY-MM-DD"));

            // Jika hari berikutnya bukan hari libur atau Minggu dan memiliki shift
            if (
              !isHoliday(nextDate.format("YYYY-MM-DD"))
              // &&
              // nextDay !== "Minggu"
            ) {
              const nextShiftInfo = getShiftInfo(nextDay, nextDate);

              if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
                nextDateTime = moment(
                  `${nextDate.format("YYYY-MM-DD")}T${
                    nextShiftInfo.shift_1_masuk
                  }`
                );
                continue;
              }
            }

            // Jika tidak bisa masuk ke hari berikutnya, cari hari kerja terdekat
            let validWorkDate = moment(nextDate);
            let validWorkDay = nextDay;

            while (
              isHoliday(validWorkDate.format("YYYY-MM-DD")) ||
              //validWorkDay === "Minggu" ||
              !getShiftInfo(validWorkDay, validWorkDate)
            ) {
              validWorkDate.add(1, "days");
              validWorkDay = getDayOfWeek(validWorkDate.format("YYYY-MM-DD"));
            }

            const validShiftInfo = getShiftInfo(validWorkDay, validWorkDate);

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

      // Update data berikutnya dengan mempertimbangkan shift dan hari libur
      let updatedDateTime = newDateTime;

      // Interval waktu tetap (biasanya 60 menit)
      const fixedInterval = 60;

      for (const data of subsequentData) {
        // Mendapatkan waktu valid berikutnya
        updatedDateTime = getNextValidDateTime(updatedDateTime, fixedInterval);

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
