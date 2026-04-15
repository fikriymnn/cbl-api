const { Op, Sequelize } = require("sequelize");
const JadwalProduksi = require("../../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const masterShift = require("../../../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../../../model/masterData/hr/masterShift/masterIstirahatModel");
const JadwalKaryawan = require("../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const JadwalLemburProduksi = require("../../../model/ppic/jadwalProduksi/jadwalLemburModel");
const db = require("../../../config/database");
const moment = require("moment-timezone");
const lemburFunction = require("../../../helper/lemburJadwalProduksiMonlyFunction");

const jadwalProduksiViewController = {
  getJadwalProduksiView: async (req, res) => {
    try {
      const { status, start_date, end_date, mesin, page, limit, search } =
        req.query;
      const { id } = req.params;

      // BUG FIX: Validasi input start_date dan end_date
      if (!id && (!start_date || !end_date)) {
        return res
          .status(400)
          .json({ msg: "start_date dan end_date wajib diisi." });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      if (id) {
        const dataById = await JadwalProduksi.findByPk(id);
        if (!dataById) {
          return res.status(404).json({ msg: "Data tidak ditemukan." });
        }
        return res.status(200).json({ data: dataById });
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
        return res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  getJadwalProduksiWeeklyView: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;

      // BUG FIX: Validasi input
      if (!start_date || !end_date) {
        return res
          .status(400)
          .json({ msg: "start_date dan end_date wajib diisi." });
      }

      // BUG FIX #4 (Rekomendasi): Tambahkan attributes agar tidak error di strict SQL mode
      const data = await JadwalProduksi.findAll({
        attributes: [
          "no_jo",
          "tanggal",
          "mesin",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "jumlah"],
        ],
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
      return res.status(200).json({ data: data });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // BUG FIX #3: createJadwalProduksiView — ambil data dari req.body bukan variabel undefined
  createJadwalProduksiView: async (req, res) => {
    const t = await db.transaction();
    try {
      const { data } = req.body;

      if (!data || !Array.isArray(data) || data.length === 0) {
        await t.rollback();
        return res
          .status(400)
          .json({ msg: "Data jadwal wajib diisi dan berupa array." });
      }

      await JadwalProduksi.bulkCreate(data, { transaction: t });
      await t.commit();
      return res.status(200).json({ msg: "create success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  updateJadwalProduksiView: async (req, res) => {
    const _id = req.params.id;
    const { data_jadwal, isSemuaTahap } = req.body;
    const t = await db.transaction();
    try {
      const dataToUpdate = await JadwalProduksi.findByPk(_id);

      // BUG FIX #8: Kirim HTTP response yang benar jika data tidak ditemukan
      if (!dataToUpdate) {
        await t.rollback();
        return res.status(404).json({ message: "Data tidak ditemukan." });
      }

      const jadwalLembur = await JadwalLemburProduksi.findAll({
        where: { tanggal_lembur: { [Op.gte]: data_jadwal.tanggal } },
      });

      const lastTanggal = new Date(dataToUpdate.tanggal);
      const lastDate = lastTanggal.toISOString().split("T")[0];

      const newTanggal = new Date(data_jadwal.tanggal);
      const newDate = newTanggal.toISOString().split("T")[0];

      const originalDateTime = moment.utc(`${lastDate}T${dataToUpdate.jam}`);
      const newDateTime = moment.utc(`${newDate}T${data_jadwal.jam}`);

      const timeDifference = newDateTime.diff(originalDateTime);

      let allDataAfterUpdate = [];

      if (isSemuaTahap) {
        if (dataToUpdate.no_jo) {
          allDataAfterUpdate = await JadwalProduksi.findAll({
            where: {
              [Op.and]: [
                { no_jo: dataToUpdate.no_jo },
                {
                  [Op.or]: [
                    { tanggal: { [Op.gt]: dataToUpdate.tanggal } },
                    {
                      [Op.and]: [
                        { tanggal: dataToUpdate.tanggal },
                        { jam: { [Op.gte]: dataToUpdate.jam } },
                      ],
                    },
                  ],
                },
              ],
              tahapan_ke: { [Op.gte]: dataToUpdate.tahapan_ke },
            },
            order: [
              ["mesin", "ASC"],
              ["tanggal", "ASC"],
              ["jam", "ASC"],
            ],
          });
        } else {
          allDataAfterUpdate = await JadwalProduksi.findAll({
            where: {
              [Op.and]: [
                { no_booking: dataToUpdate.no_booking },
                {
                  [Op.or]: [
                    { tanggal: { [Op.gt]: dataToUpdate.tanggal } },
                    {
                      [Op.and]: [
                        { tanggal: dataToUpdate.tanggal },
                        { jam: { [Op.gte]: dataToUpdate.jam } },
                      ],
                    },
                  ],
                },
              ],
              tahapan_ke: { [Op.gte]: dataToUpdate.tahapan_ke },
            },
            order: [
              ["mesin", "ASC"],
              ["tanggal", "ASC"],
              ["jam", "ASC"],
            ],
          });
        }
      } else {
        allDataAfterUpdate.push(dataToUpdate);
      }

      const firstDataPerMachine = [];
      const processedMachines = new Set();

      for (const item of allDataAfterUpdate) {
        if (!processedMachines.has(item.mesin)) {
          firstDataPerMachine.push(item);
          processedMachines.add(item.mesin);
        }
      }

      const sortedData = firstDataPerMachine.sort((a, b) => {
        const dateTimeA = new Date(
          new Date(a.tanggal).toISOString().split("T")[0] + "T" + a.jam,
        );
        const dateTimeB = new Date(
          new Date(b.tanggal).toISOString().split("T")[0] + "T" + b.jam,
        );
        return dateTimeA - dateTimeB;
      });

      function adjustScheduleByTimeChange(data, perbedaanJam) {
        const cloned = JSON.parse(JSON.stringify(data));

        return cloned.map((d) => {
          const lastTanggal = new Date(d.tanggal);
          const lastDate = lastTanggal.toISOString().split("T")[0];
          const currentDateTime = moment.utc(`${lastDate}T${d.jam}`);
          const updatedDateTime = moment(currentDateTime).add(
            perbedaanJam,
            "milliseconds",
          );
          const updatedDate = updatedDateTime.toISOString().split("T")[0];
          const updatedTime = updatedDateTime
            .toISOString()
            .split("T")[1]
            .split(".")[0];

          return { ...d, tanggal: updatedDate, jam: updatedTime };
        });
      }

      const updated = adjustScheduleByTimeChange(sortedData, timeDifference);

      for (let i = 0; i < updated.length; i++) {
        const elementData = updated[i];
        const dataLemburMesin = jadwalLembur.filter(
          (L) => L.mesin == elementData.mesin,
        );

        await lemburFunction.changeLemburMonly(
          elementData,
          dataLemburMesin,
          elementData.id,
          false,
        );
      }

      // BUG FIX #4: Commit transaksi yang sebelumnya dikomentari
      await t.commit();

      return res
        .status(200)
        .json({ msg: "update success", tes: sortedData, up: updated });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  moveJadwalProduksiView: async (req, res) => {
    const _id = req.params.id;
    const { data_jadwal, tanggal, jam } = req.body;
    const t = await db.transaction();
    try {
      const dataToUpdate = await JadwalProduksi.findByPk(_id);

      // BUG FIX #8: Kirim HTTP response yang benar jika data tidak ditemukan
      if (!dataToUpdate) {
        await t.rollback();
        return res.status(404).json({ message: "Data tidak ditemukan." });
      }

      const jadwalLembur = await JadwalLemburProduksi.findAll({
        where: {
          tanggal_lembur: { [Op.gte]: data_jadwal.tanggal },
          mesin: data_jadwal.mesin,
        },
      });

      const lastTanggal = new Date(dataToUpdate.tanggal);
      const lastDate = lastTanggal.toISOString().split("T")[0];

      const newTanggal = new Date(data_jadwal.tanggal);
      const newDate = newTanggal.toISOString().split("T")[0];

      const originalDateTime = moment.utc(`${lastDate}T${dataToUpdate.jam}`);
      const newDateTime = moment.utc(`${newDate}T${data_jadwal.jam}`);

      const timeDifference = newDateTime.diff(originalDateTime);

      let allDataAfterUpdate = [];

      if (dataToUpdate.no_jo) {
        allDataAfterUpdate = await JadwalProduksi.findAll({
          where: {
            no_jo: dataToUpdate.no_jo,
            mesin: dataToUpdate.mesin,
          },
          order: [
            ["mesin", "ASC"],
            ["tanggal", "ASC"],
            ["jam", "ASC"],
          ],
        });
      } else {
        allDataAfterUpdate = await JadwalProduksi.findAll({
          where: {
            no_booking: dataToUpdate.no_booking,
            mesin: dataToUpdate.mesin,
          },
          order: [
            ["mesin", "ASC"],
            ["tanggal", "ASC"],
            ["jam", "ASC"],
          ],
        });
      }

      const firstDataPerMachine = [];
      const processedMachines = new Set();

      for (const item of allDataAfterUpdate) {
        if (!processedMachines.has(item.mesin)) {
          firstDataPerMachine.push(item);
          processedMachines.add(item.mesin);
        }
      }

      const sortedData = firstDataPerMachine.sort((a, b) => {
        const dateTimeA = new Date(
          new Date(a.tanggal).toISOString().split("T")[0] + "T" + a.jam,
        );
        const dateTimeB = new Date(
          new Date(b.tanggal).toISOString().split("T")[0] + "T" + b.jam,
        );
        return dateTimeA - dateTimeB;
      });

      function adjustScheduleByTimeChange(data, perbedaanJam) {
        const cloned = JSON.parse(JSON.stringify(data));

        return cloned.map((d) => {
          const lastTanggal = new Date(d.tanggal);
          const lastDate = lastTanggal.toISOString().split("T")[0];
          const currentDateTime = moment.utc(`${lastDate}T${d.jam}`);
          const updatedDateTime = moment(currentDateTime).add(
            perbedaanJam,
            "milliseconds",
          );
          const updatedDate = updatedDateTime.toISOString().split("T")[0];
          const updatedTime = updatedDateTime
            .toISOString()
            .split("T")[1]
            .split(".")[0];

          return { ...d, tanggal: updatedDate, jam: updatedTime };
        });
      }

      const updated = adjustScheduleByTimeChange(sortedData, timeDifference);

      const respon = await lemburFunction.changeLemburMonly(
        data_jadwal,
        jadwalLembur,
        _id,
        true,
      );

      // BUG FIX #6: Commit transaksi yang sebelumnya tidak pernah dipanggil
      await t.commit();

      return res
        .status(200)
        .json({ msg: "update success", tes: sortedData, up: updated });
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
      const dataToUpdate = await JadwalProduksi.findByPk(_id);

      if (!dataToUpdate) {
        await t.rollback();
        return res.status(404).json({ message: "Data tidak ditemukan." });
      }

      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      oneYearFromNow.setHours(23, 59, 59, 999);

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
        include: [{ model: masterIstirahat, as: "istirahat" }],
      });

      let jadwalLibur = [];
      dataJadwal.map((jadwal) => {
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

      const timeDifference = newDateTime.diff(originalDateTime);

      // Update data utama terlebih dahulu
      await JadwalProduksi.update(
        { tanggal: data_jadwal.tanggal, jam: data_jadwal.jam },
        { where: { id: _id }, transaction: t },
      );

      const subsequentData = await JadwalProduksi.findAll({
        where: {
          [Op.or]: [
            { tanggal: { [Op.gt]: dataToUpdate.tanggal } },
            {
              tanggal: dataToUpdate.tanggal,
              jam: { [Op.gt]: dataToUpdate.jam },
            },
          ],
          mesin: dataToUpdate.mesin,
        },
        order: [
          ["tanggal", "ASC"],
          ["jam", "ASC"],
        ],
      });

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

      const isHoliday = (date) => jadwalLiburSet.has(date);

      // BUG FIX #7: Gunakan batas shift konsisten (Shift1: 08-19, Shift2: 20-07)
      const isOvertimeDay = (date, time = null) => {
        if (!tgl_lembur) return false;

        const formattedDate = new Date(date).toISOString().split("T")[0];
        const formattedOvertimeDate = new Date(tgl_lembur)
          .toISOString()
          .split("T")[0];

        if (formattedDate === formattedOvertimeDate) {
          return true;
        }

        if (time) {
          const hourOfDay = parseInt(time.split(":")[0], 10);
          if (hourOfDay < 8) {
            const prevDate = moment(date)
              .subtract(1, "days")
              .format("YYYY-MM-DD");
            const formattedPrevDate = new Date(prevDate)
              .toISOString()
              .split("T")[0];
            if (formattedPrevDate === formattedOvertimeDate) {
              return true;
            }
          }
        }

        return false;
      };

      const getShiftInfo = (day) =>
        dataShift.find((shift) => shift.hari === day) || null;

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

      const isWorkingHour = (dateTime, shiftInfo) => {
        if (!shiftInfo) return { isWorking: false };

        const time = dateTime.format("HH:mm:ss");
        const date = dateTime.format("YYYY-MM-DD");
        const hourOfDay = parseInt(time.split(":")[0], 10);

        if (isOvertimeDay(date, time)) {
          // BUG FIX #7: Gunakan batas shift 08-19 dan 20-07 konsisten
          if (hourOfDay >= 8 && hourOfDay < 20) {
            return { isWorking: true, shift: 1, isOvertimeShift: true };
          } else {
            return { isWorking: true, shift: 2, isOvertimeShift: true };
          }
        }

        const prevDate = moment(date).subtract(1, "days").format("YYYY-MM-DD");
        const prevDay = getDayOfWeek(prevDate);
        const prevShiftInfo = getShiftInfo(prevDay);

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
          return { isWorking: true, shift: 2, isPrevDayShift: true };
        }

        return { isWorking: false };
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

          if (isOvertimeDay(date, time)) {
            const shiftInfo = getShiftInfo(day);
            if (shiftInfo && shiftInfo.istirahat) {
              const breakCheck = isBreakTime(time, shiftInfo.istirahat);
              if (breakCheck.isBreak) {
                nextDateTime = moment(`${date}T${breakCheck.breakEndTime}`);
                continue;
              }
            }

            // BUG FIX #7: Gunakan batas overnight 20:00-07:59
            if (hourOfDay >= 20 || hourOfDay < 8) {
              return nextDateTime;
            }

            if (hourOfDay === 19 && parseInt(time.split(":")[1], 10) >= 59) {
              nextDateTime = moment(`${date}T20:00:00`);
              continue;
            }

            break;
          }

          const shiftInfo = getShiftInfo(day);

          const nextDate = moment(date).add(1, "days");
          const isNextDayHoliday = isHoliday(nextDate.format("YYYY-MM-DD"));
          const isNextDayOvertime = isOvertimeDay(
            nextDate.format("YYYY-MM-DD"),
          );

          if (
            shiftInfo &&
            shiftInfo.shift_2_masuk &&
            shiftInfo.shift_2_keluar &&
            (isNextDayHoliday || isNextDayOvertime)
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
            const prevDay = getDayOfWeek(prevDate.format("YYYY-MM-DD"));
            const prevShiftInfo = getShiftInfo(prevDay);
            const isPrevDayOvertime = isOvertimeDay(
              prevDate.format("YYYY-MM-DD"),
            );

            if (isPrevDayOvertime && hourOfDay < 8) {
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
            let nextWorkDay = getDayOfWeek(
              nextWorkingDate.format("YYYY-MM-DD"),
            );

            while (
              isHoliday(nextWorkingDate.format("YYYY-MM-DD")) &&
              !isOvertimeDay(nextWorkingDate.format("YYYY-MM-DD"))
            ) {
              nextWorkingDate.add(1, "days");
              nextWorkDay = getDayOfWeek(nextWorkingDate.format("YYYY-MM-DD"));
            }

            if (isOvertimeDay(nextWorkingDate.format("YYYY-MM-DD"))) {
              nextDateTime = moment(
                `${nextWorkingDate.format("YYYY-MM-DD")}T00:00:00`,
              );
              continue;
            }

            const nextShiftInfo = getShiftInfo(nextWorkDay);
            if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${nextWorkingDate.format("YYYY-MM-DD")}T${nextShiftInfo.shift_1_masuk}`,
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

            if (isOvertimeDay(nextDayDateInner)) {
              nextDateTime = moment(`${nextDayDateInner}T00:00:00`);
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
            let validWorkDay = nextDayInner;

            while (
              isHoliday(validWorkDate.format("YYYY-MM-DD")) &&
              !isOvertimeDay(validWorkDate.format("YYYY-MM-DD")) &&
              !getShiftInfo(validWorkDay)
            ) {
              validWorkDate.add(1, "days");
              validWorkDay = getDayOfWeek(validWorkDate.format("YYYY-MM-DD"));
            }

            if (isOvertimeDay(validWorkDate.format("YYYY-MM-DD"))) {
              nextDateTime = moment(
                `${validWorkDate.format("YYYY-MM-DD")}T00:00:00`,
              );
              continue;
            }

            const validShiftInfo = getShiftInfo(validWorkDay);
            if (validShiftInfo && validShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${validWorkDate.format("YYYY-MM-DD")}T${validShiftInfo.shift_1_masuk}`,
              );
              continue;
            }
          }

          break;
        }

        // BUG FIX #5 (Rekomendasi): Log warning jika loop safety tercapai
        if (loopSafety >= 1000) {
          console.warn(
            "[changeLemburJadwalProduksiView] Loop safety limit reached.",
          );
        }

        return nextDateTime;
      };

      let updatedDateTime = newDateTime;
      const normalInterval = 60;
      const overtimeInterval = 60;

      for (const data of subsequentData) {
        const currentDate = updatedDateTime.format("YYYY-MM-DD");
        const currentTime = updatedDateTime.format("HH:mm:ss");
        const hourOfDay = parseInt(currentTime.split(":")[0], 10);

        // BUG FIX #7: Batas overnight konsisten 20-07
        const isOvernightOvertime =
          isOvertimeDay(currentDate, currentTime) &&
          (hourOfDay >= 20 || hourOfDay < 8);

        const interval = isOvertimeDay(currentDate, currentTime)
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
          isOvertimeDay(currentDate, currentTime) &&
          hourOfDay === 19 &&
          parseInt(currentTime.split(":")[1], 10) >= 59
        ) {
          // BUG FIX #7: Transisi shift 1 ke shift 2 di jam 20:00 bukan 12:00
          const shiftChangeTime = moment(`${currentDate}T20:00:00`);
          updatedDateTime = shiftChangeTime;
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

      return res.status(200).json({ msg: "update success" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  // BUG FIX #1: changeLemburMonlyJadwalProduksiView — list_lembur diambil dari req.body
  changeLemburMonlyJadwalProduksiView: async (req, res) => {
    const _id = req.params.id;
    const { data_jadwal, mesin, list_lembur } = req.body;

    // Validasi list_lembur
    if (
      !list_lembur ||
      !Array.isArray(list_lembur) ||
      list_lembur.length === 0
    ) {
      return res
        .status(400)
        .json({ msg: "list_lembur wajib diisi dan berupa array." });
    }

    try {
      await lemburFunction.changeLemburMonly(data_jadwal, list_lembur, _id);
      return res.status(200).json({ msg: "update success" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = jadwalProduksiViewController;
