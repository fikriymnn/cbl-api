const { Op, Sequelize, where } = require("sequelize");
const JadwalKaryawan = require("../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const TiketJadwalProduksi = require("../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiModel");
const TiketJadwalProduksiTahapan = require("../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiTahapanModel");
const TiketJadwalProduksiPerJam = require("../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiPerJamModel");
const TiketPerubahanTanggalKirim = require("../../../model/ppic/jadwalProduksiCalculateModel/tiketPerubahanTanggalKirimModel");
const JadwalProduksi = require("../../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const masterShift = require("../../../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../../../model/masterData/hr/masterShift/masterIstirahatModel");

const db = require("../../../config/database");
const JadwalCalculateService = require("./service/jadwalCalculateService");
const JadwalAdjustService = require("./service/jadwalAdjustService");

const moment = require("moment");

// error dari service membawa status + payload; selain itu 500
const sendServiceError = (res, err) => {
  if (err && err.status) {
    return res.status(err.status).json(err.payload || { msg: err.message });
  }
  return res.status(500).json({ msg: err.message });
};

const jadwalProduksiController = {
  getTiketJadwalProduksi: async (req, res) => {
    try {
      const {
        status,
        status_tiket,
        tgl,
        page,
        limit,
        search,
        start_date,
        end_date,
        start_date_cancel,
        end_date_cancel,
        type,
        is_send_again,
        sort_cancel,
        sort_tgl_kirim,
      } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};

      if (search) {
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { item: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (status) obj.status = status;
      if (status_tiket) obj.status_tiket = status_tiket;
      if (tgl) obj.tgl = tgl;
      if (type) obj.type = type;
      if (is_send_again)
        obj.is_send_again = is_send_again == "true" ? true : false;
      if (start_date && end_date) {
        obj.tgl_kirim_date = {
          [Op.between]: [
            new Date(start_date).setHours(0, 0, 0, 0),
            new Date(end_date).setHours(23, 59, 59, 999),
          ],
        };
      }
      let orderCancelClause = null;

      if (sort_cancel) {
        const orderCancelDirection = sort_cancel === "oldest" ? "ASC" : "DESC";
        orderCancelClause = [["tgl_cancel", orderCancelDirection]];
      }

      if (sort_tgl_kirim) {
        const orderKirimDirection =
          sort_tgl_kirim === "oldest" ? "ASC" : "DESC";
        orderCancelClause = [["tgl_kirim_date", orderKirimDirection]];
      }

      if (!sort_cancel && !sort_tgl_kirim) {
        orderCancelClause = [["createdAt", "DESC"]];
      }

      if (start_date_cancel && end_date_cancel) {
        obj.tgl_cancel = {
          [Op.between]: [
            new Date(start_date_cancel).setHours(0, 0, 0, 0),
            new Date(end_date_cancel).setHours(23, 59, 59, 999),
          ],
        };
      }

      if (page && limit) {
        const length = await TiketJadwalProduksi.count({ where: obj });
        const data = await TiketJadwalProduksi.findAll({
          order: orderCancelClause,
          where: obj,
          limit: parseInt(limit),
          offset,
          include: [
            {
              model: TiketPerubahanTanggalKirim,
              as: "tanggal_perubahan",
            },
          ],
        });

        return res.status(200).json({
          status_code: 200,
          success: true,
          data: data,
          total_data: length,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await TiketJadwalProduksi.findByPk(id, {
          include: [
            {
              model: TiketJadwalProduksiTahapan,
              as: "tahap",
              include: [
                {
                  model: TiketJadwalProduksiPerJam,
                  as: "jadwal_per_jam",
                  separate: true,
                  order: [
                    ["tanggal", "ASC"], // Urutkan berdasarkan tanggal (terlama ke terbaru)
                    ["jam", "ASC"], // Jika tanggal sama, urutkan berdasarkan jam (terlama ke terbaru)
                  ],
                },
              ],
            },
            {
              model: TiketJadwalProduksiPerJam,
              as: "jadwal_per_jam",
            },

            {
              model: TiketPerubahanTanggalKirim,
              as: "tanggal_perubahan",
            },
          ],
        });
        res.status(200).json({ data: data });
      } else {
        const data = await TiketJadwalProduksi.findAll({
          order: [["tgl_kirim_date", "DESC"]],
          where: obj,
          include: [
            {
              model: TiketPerubahanTanggalKirim,
              as: "tanggal_perubahan",
            },
          ],
        });
        res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createTiketJadwalProduksi: async (req, res) => {
    const {
      item,
      no_jo,
      no_booking,
      no_po,
      no_io,
      customer,
      nama_bahan,
      tgl_kirim,
      tgl_so,
      tgl_cetak,
      qty_po,
      qty_pcs,
      qty_druk,
      qty_lp,
      tahap,
    } = req.body;
    const t = await db.transaction();

    try {
      if (no_jo && no_booking) {
        let obj = {};
        if (item) obj.item = item;
        if (no_jo) obj.no_jo = no_jo;
        if (no_po) obj.no_po = no_po;
        if (no_io) obj.no_io = no_io;
        if (customer) obj.customer = customer;
        if (qty_po) obj.qty_po = qty_po;
        if (tgl_so) obj.tgl_so = tgl_so;
        if (nama_bahan) obj.nama_bahan = nama_bahan;
        if (qty_lp) obj.qty_lp = qty_lp;
        const checkBooking = await JadwalProduksi.findAll({
          where: { no_booking: no_booking },
        });

        if (checkBooking.length === 0)
          return res.status(404).json({
            status_code: 404,
            success: false,
            msg: "no booking tidak di temukan atau no booking belum di kalkulasi",
          });
        await JadwalProduksi.update(obj, {
          where: { no_booking: no_booking },
          transaction: t,
        });
        await TiketJadwalProduksi.update(
          { status_tiket: "history", no_jo: no_jo },
          { where: { no_booking: no_booking }, transaction: t },
        );
        await t.commit();
        res.status(200).json({
          status_code: 200,
          success: true,
          msg: "update booking with jo success",
        });
      } else if (no_jo) {
        const dataTiket = await TiketJadwalProduksi.create(
          {
            item,
            no_jo,
            no_po,
            no_io,
            customer,
            nama_bahan,
            type: "jadwal",
            tgl_kirim,
            tgl_kirim_date: tgl_kirim,
            tgl_kirim_update: tgl_kirim,
            tgl_kirim_update_date: tgl_kirim,
            tgl_so,
            tgl_so_date: tgl_so,
            tgl_cetak,
            qty_po,
            qty_pcs,
            qty_druk,
            qty_lp,
          },
          { transaction: t },
        );
        let dataTahapan = [];
        for (let i = 0; i < tahap.length; i++) {
          const data = tahap[i];
          let fromData = "";
          const tahapanString = data.tahapan.toLowerCase();

          if (
            tahapanString.includes("potong") ||
            tahapanString.includes("plate") ||
            tahapanString.includes("sampling") ||
            tahapanString.includes("packing") ||
            tahapanString.includes("final inspection") ||
            tahapanString.includes("kirim")
          ) {
            fromData = "tgl";
          } else if (
            tahapanString.includes("lem") ||
            tahapanString.includes("lipat") ||
            tahapanString.includes("finishing")
          ) {
            fromData = "pcs";
          } else {
            fromData = "druk";
          }

          dataTahapan.push({
            id_tiket_jadwal_produksi: dataTiket.id,
            item: item,
            tahapan: data.tahapan,
            tahapan_ke: data.tahapan_ke,
            from: fromData,
            nama_kategori: data.nama_kategori,
            kategori: data.kategori,
            kategori_drying_time: data.kategori_drying_time,
            mesin: data.mesin,
            kapasitas_per_jam: data.kapasitas_per_jam,
            drying_time: data.drying_time,
            setting: data.setting,
            toleransi: data.toleransi,
          });
        }

        const findTahapFG = dataTahapan.find((data) => data.tahapan === "FG");

        if (!findTahapFG) {
          // Buat objek tahapan FG
          let tahapanFG = {
            id_tiket_jadwal_produksi: dataTiket.id,
            item: item,
            tahapan: "FG",
            tahapan_ke: 0,
            from: "tgl",
            nama_kategori: "",
            kategori: "",
            kategori_drying_time: "",
            mesin: "",
            kapasitas_per_jam: 0,
            drying_time: 0,
            setting: 0,
            toleransi: 0,
          };

          // Tentukan posisi kedua terakhir (sebelum "Kirim")
          let insertIndex = dataTahapan.length - 1;

          // Sisipkan tahapan FG pada posisi kedua terakhir
          dataTahapan.splice(insertIndex, 0, tahapanFG);

          // Perbarui tahapan_ke secara otomatis
          dataTahapan.forEach((item, index) => {
            item.tahapan_ke = index + 1;
          });
        }

        await TiketJadwalProduksiTahapan.bulkCreate(dataTahapan, {
          transaction: t,
        });
        await t.commit();
        res.status(200).json({
          status_code: 200,
          success: true,
          msg: "create jadwal success",
        });
      } else if (no_booking) {
        const dataTiket = await TiketJadwalProduksi.create(
          {
            item,
            no_booking,
            no_po,
            no_io,
            customer,
            nama_bahan,
            type: "booking",
            tgl_kirim,
            tgl_kirim_date: tgl_kirim,
            tgl_kirim_update: tgl_kirim,
            tgl_kirim_update_date: tgl_kirim,
            tgl_so,
            tgl_so_date: tgl_so,
            tgl_cetak,
            qty_po,
            qty_pcs,
            qty_druk,
            qty_lp,
          },
          { transaction: t },
        );
        let dataTahapan = [];
        for (let i = 0; i < tahap.length; i++) {
          const data = tahap[i];
          let fromData = "";
          const tahapanString = data.tahapan.toLowerCase();

          if (
            tahapanString.includes("potong") ||
            tahapanString.includes("plate") ||
            tahapanString.includes("sampling") ||
            tahapanString.includes("packing") ||
            tahapanString.includes("final inspection") ||
            tahapanString.includes("kirim")
          ) {
            fromData = "tgl";
          } else if (
            tahapanString.includes("lem") ||
            tahapanString.includes("lipat") ||
            tahapanString.includes("finishing")
          ) {
            fromData = "pcs";
          } else {
            fromData = "druk";
          }

          dataTahapan.push({
            id_tiket_jadwal_produksi: dataTiket.id,
            item: item,
            tahapan: data.tahapan,
            tahapan_ke: data.tahapan_ke,
            from: fromData,
            nama_kategori: data.nama_kategori,
            kategori: data.kategori,
            kategori_drying_time: data.kategori_drying_time,
            mesin: data.mesin,
            kapasitas_per_jam: data.kapasitas_per_jam,
            drying_time: data.drying_time,
            setting: data.setting,
            toleransi: data.toleransi,
          });
        }

        const findTahapFG = dataTahapan.find((data) => data.tahapan === "FG");
        const indexFinalInspection = dataTahapan.findIndex((data) =>
          data.tahapan.toLowerCase().includes("final inspection"),
        );

        if (!findTahapFG && indexFinalInspection !== -1) {
          // Buat objek tahapan FG
          let tahapanFG = {
            id_tiket_jadwal_produksi: dataTiket.id,
            item: item,
            tahapan: "FG",
            tahapan_ke: 0,
            from: "tgl",
            nama_kategori: "",
            kategori: "",
            kategori_drying_time: "",
            mesin: "",
            kapasitas_per_jam: 0,
            drying_time: 0,
            setting: 0,
            toleransi: 0,
          };

          // Jika ditemukan, sisipkan FG setelahnya
          const insertIndex = indexFinalInspection + 1;

          dataTahapan.splice(insertIndex, 0, tahapanFG);

          // Perbarui tahapan_ke
          dataTahapan.forEach((item, index) => {
            item.tahapan_ke = index + 1;
          });
        }

        await TiketJadwalProduksiTahapan.bulkCreate(dataTahapan, {
          transaction: t,
        });
        await t.commit();
        res.status(200).json({
          status_code: 200,
          success: true,
          msg: "create booking success",
        });
      } else {
        return res.status(404).json({
          status_code: 404,
          success: false,
          msg: "tidak ada no_jo atau no_booking",
        });
      }
    } catch (err) {
      await t.rollback();
      res
        .status(500)
        .json({ status_code: 500, success: false, msg: err.message });
    }
  },

  calculateTiketJadwalProduksi: async (req, res) => {
    const { id } = req.params;
    const { is_lembur } = req.query;
    try {
      // logika calculate ada di service/jadwalCalculateService.js
      const result = await JadwalCalculateService.calculateTiket(id, {
        isLembur: is_lembur,
      });
      res.status(200).json(result);
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  // ---- ubah hasil calculate (geser / ubah kapasitas / ubah drying) ----
  // lihat docs/frontend-edit-jadwal-produksi.md

  availabilityJadwalProduksi: async (req, res) => {
    try {
      const data = await JadwalAdjustService.availability(
        req.params.id_tahapan,
        req.query,
      );
      res.status(200).json({ data });
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  simulateJadwalProduksi: async (req, res) => {
    try {
      const data = await JadwalAdjustService.simulate(
        req.params.id_tahapan,
        req.body || {},
      );
      res.status(200).json({ data });
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  suggestSlotJadwalProduksi: async (req, res) => {
    try {
      const data = await JadwalAdjustService.suggestSlot(
        req.params.id_tahapan,
        req.body || {},
      );
      res.status(200).json({ data });
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  applyJadwalProduksi: async (req, res) => {
    try {
      const data = await JadwalAdjustService.apply(
        req.params.id_tahapan,
        req.body || {},
        req.user,
      );
      res.status(200).json({ msg: "Perubahan jadwal disimpan", data });
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  // bentrok mesin (R1) jadwal tiket sekarang. :id = id tiket
  getConflictsJadwalProduksi: async (req, res) => {
    try {
      const data = await JadwalAdjustService.getConflicts(req.params.id);
      res.status(200).json({ data });
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  // preview "selesaikan semua bentrok otomatis" (tidak menyimpan). :id = id tiket
  resolveConflictsPreviewJadwalProduksi: async (req, res) => {
    try {
      const data = await JadwalAdjustService.resolveConflictsPreview(
        req.params.id,
        req.body || {},
      );
      res.status(200).json({ data });
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  // simpan "selesaikan semua bentrok otomatis". :id = id tiket
  resolveConflictsApplyJadwalProduksi: async (req, res) => {
    try {
      const data = await JadwalAdjustService.resolveConflictsApply(
        req.params.id,
        req.body || {},
        req.user,
      );
      res.status(200).json({ msg: "Bentrok jadwal diselesaikan", data });
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  getAdjustLogJadwalProduksi: async (req, res) => {
    try {
      const data = await JadwalAdjustService.getAdjustLog(req.params.id);
      res.status(200).json({ data });
    } catch (err) {
      sendServiceError(res, err);
    }
  },

  updateTiketJadwalProduksi: async (req, res) => {
    const _id = req.params.id;
    const { data_jadwal } = req.body;
    const t = await db.transaction();
    try {
      // Cari data yang akan diubah berdasarkan ID
      const dataToUpdate = await TiketJadwalProduksiPerJam.findByPk(_id);

      if (!dataToUpdate) {
        return res.status(404).json({ message: "Data tidak ditemukan." });
      }

      const dataTiket = await TiketJadwalProduksi.findByPk(
        dataToUpdate.id_tiket_jadwal_produksi,
      );
      if (!dataTiket) {
        return res.status(404).json({ message: "Data tiket tidak ditemukan." });
      }

      const dataJadwal = await JadwalKaryawan.findAll({
        order: [["createdAt", "DESC"]],
        where: {
          tanggal: {
            [Op.between]: [
              new Date().setHours(0, 0, 0, 0),
              new Date(dataTiket.tgl_kirim).setHours(23, 59, 59, 999),
            ],
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

      //untuk mengecek apakah calculate dengan lembut atau tidak, jika dengan lembur maka modifikasi jam shift
      if (data_jadwal.is_lembur === true || data_jadwal.is_lembur === "true") {
        dataShift.forEach((shift) => {
          shift.shift_1_masuk = "08:00:00";
          shift.shift_1_keluar = "20:00:00";
          shift.shift_2_masuk = "20:00:00";
          shift.shift_2_keluar = "08:00:00";
        });
      }

      // Jadwal libur
      let jadwalLibur = [];

      //untuk mengecek apakah calculate dengan lembut atau tidak, jika dengan lembur maka jadwal libut tidak di set
      if (data_jadwal.is_lembur === true || data_jadwal.is_lembur === "true") {
        // dibuat seperti ini karena ada bug ketika menggunakan operator !=
      } else {
        dataJadwal.map((jadwal) => {
          const date = new Date(jadwal.tanggal);
          const formattedDate = date.toISOString().slice(0, 10);
          jadwalLibur.push(formattedDate);
        });
      }

      const jadwalLiburSet = new Set(
        jadwalLibur.map((date) => new Date(date).toISOString().split("T")[0]),
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
      await TiketJadwalProduksiPerJam.update(
        { tanggal: data_jadwal.tanggal, jam: data_jadwal.jam },
        { where: { id: _id }, transaction: t },
      );

      // Ambil semua data berikutnya berdasarkan tanggal dan jam
      const subsequentData = await TiketJadwalProduksiPerJam.findAll({
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
          id_tiket_jadwal_produksi: dataToUpdate.id_tiket_jadwal_produksi,
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

      // Helper function yang diperbaiki untuk memeriksa apakah waktu berada dalam jam kerja shift
      const isWorkingHour = (dateTime, shiftInfo) => {
        if (!shiftInfo) return { isWorking: false };

        const time = dateTime.format("HH:mm:ss");
        const date = dateTime.format("YYYY-MM-DD");

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

      // Ubah fungsi getNextValidDateTime untuk memastikan shift 2 selesai sebelum beralih ke hari berikutnya
      const getNextValidDateTime = (currentDateTime, intervalInMinutes) => {
        // Tambahkan interval waktu ke waktu saat ini
        let nextDateTime = moment(currentDateTime).add(
          intervalInMinutes,
          "minutes",
        );
        let loopSafety = 0; // Mencegah infinite loop

        while (loopSafety < 1000) {
          loopSafety++;

          const date = nextDateTime.format("YYYY-MM-DD");
          const time = nextDateTime.format("HH:mm:ss");
          const day = getDayOfWeek(date);

          // Dapatkan data shift untuk hari ini
          const shiftInfo = getShiftInfo(day);

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
            const prevShiftInfo = getShiftInfo(prevDay);

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
              nextWorkingDate.format("YYYY-MM-DD"),
            );

            while (
              isHoliday(nextWorkingDate.format("YYYY-MM-DD"))
              //  ||
              // nextWorkDay === "Minggu"
            ) {
              nextWorkingDate.add(1, "days");
              nextWorkDay = getDayOfWeek(nextWorkingDate.format("YYYY-MM-DD"));
            }

            const nextShiftInfo = getShiftInfo(nextWorkDay);

            if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${nextWorkingDate.format("YYYY-MM-DD")}T${
                  nextShiftInfo.shift_1_masuk
                }`,
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
              const nextShiftInfo = getShiftInfo(nextDay);

              if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
                nextDateTime = moment(
                  `${nextDate.format("YYYY-MM-DD")}T${
                    nextShiftInfo.shift_1_masuk
                  }`,
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
              !getShiftInfo(validWorkDay)
            ) {
              validWorkDate.add(1, "days");
              validWorkDay = getDayOfWeek(validWorkDate.format("YYYY-MM-DD"));
            }

            const validShiftInfo = getShiftInfo(validWorkDay);

            if (validShiftInfo && validShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${validWorkDate.format("YYYY-MM-DD")}T${
                  validShiftInfo.shift_1_masuk
                }`,
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

        await TiketJadwalProduksiPerJam.update(
          {
            tanggal: updatedDate,
            jam: updatedTime,
          },
          { where: { id: data.id }, transaction: t },
        );
      }

      await t.commit();

      res.status(200).json({ msg: "update success" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  updateTanggalKirimTiketJadwalProduksi: async (req, res) => {
    const { id } = req.params;
    const { tgl_kirim } = req.body;
    const t = await db.transaction();
    try {
      const data = await TiketJadwalProduksi.findByPk(id, {
        include: [
          {
            model: TiketJadwalProduksiTahapan,
            as: "tahap",
            include: [
              {
                model: TiketJadwalProduksiPerJam,
                as: "jadwal_per_jam",
              },
            ],
          },
          {
            model: TiketJadwalProduksiPerJam,
            as: "jadwal_per_jam",
            separate: true,
            order: [
              ["tanggal", "ASC"], // Urutkan berdasarkan tanggal (terlama ke terbaru)
              ["jam", "ASC"], // Jika tanggal sama, urutkan berdasarkan jam (terlama ke terbaru)
            ],
          },
        ],
      });

      if (!data) return res.status(404).json({ msg: "data tidak ditemukana" });

      const date = new Date(tgl_kirim);

      const formatted = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      await TiketJadwalProduksi.update(
        {
          tgl_kirim: formatted,
          tgl_kirim_date: tgl_kirim,
          tgl_kirim_update: formatted,
          tgl_kirim_update_date: tgl_kirim,
        },
        { where: { id: id }, transaction: t },
      );

      await TiketJadwalProduksiPerJam.destroy({
        where: { id_tiket_jadwal_produksi: id },
        transaction: t,
      });

      let dataJadwal = [];

      await t.commit();
      //console.log(data.jadwal_per_jam);
      res.status(200).json({ status_code: 200, message: "update success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  submitTiketJadwalProduksi: async (req, res) => {
    const { id } = req.params;
    const t = await db.transaction();
    try {
      const data = await TiketJadwalProduksi.findByPk(id, {
        include: [
          {
            model: TiketJadwalProduksiTahapan,
            as: "tahap",
            include: [
              {
                model: TiketJadwalProduksiPerJam,
                as: "jadwal_per_jam",
              },
            ],
          },
          {
            model: TiketJadwalProduksiPerJam,
            as: "jadwal_per_jam",
            separate: true,
            order: [
              ["tanggal", "ASC"], // Urutkan berdasarkan tanggal (terlama ke terbaru)
              ["jam", "ASC"], // Jika tanggal sama, urutkan berdasarkan jam (terlama ke terbaru)
            ],
          },
        ],
      });

      if (!data) {
        await t.rollback();
        return res.status(404).json({ msg: "data tidak ditemukana" });
      }

      // cek ulang bentrok mesin dengan jadwal_produksi (slot bisa sudah
      // diambil tiket lain sejak calculate)
      const conflicts = await JadwalAdjustService.checkSubmitConflicts(
        data,
        data.tahap.map((e) => ({
          id_mesin: e.id_mesin,
          mesin: e.mesin,
          tahapan: e.tahapan,
          slots: e.jadwal_per_jam,
        })),
        { transaction: t },
      );
      if (conflicts.length > 0) {
        await t.rollback();
        return res.status(409).json({
          msg: "Jadwal bentrok dengan jadwal produksi yang sudah ada. Ubah jadwal tiket terlebih dahulu.",
          conflicts,
        });
      }

      const tahapById = new Map(data.tahap.map((e) => [e.id, e]));

      let dataJadwalUpdate = [];
      for (let index = 0; index < data.tahap.length; index++) {
        const element = data.tahap[index];
        let hoursSetting = element.setting / 60; // Konversi menit ke jam (desimal)
        const setting = Number.isInteger(hoursSetting)
          ? hoursSetting
          : Math.ceil(hoursSetting);

        const kapasitas = element.kapasitas;
        const totalWaktuProduksi = setting + kapasitas;

        const dataJadwal = element.jadwal_per_jam.sort((a, b) => {
          const tanggalA = new Date(
            `${a.tanggal.toISOString().split("T")[0]}T${a.jam}`,
          );
          const tanggalB = new Date(
            `${b.tanggal.toISOString().split("T")[0]}T${b.jam}`,
          );
          return tanggalA - tanggalB;
        });

        //untuk mengambil hanya total waktu produksi saja misal total waktu 3 jam maka diambil 3 data pertama
        //let dataJamProduksi = dataJadwal.slice(0, totalWaktuProduksi);
        let dataJamProduksi = dataJadwal;
        dataJadwalUpdate.push(...dataJamProduksi);
      }

      let dataJadwal = [];

      for (let i = 0; i < dataJadwalUpdate.length; i++) {
        const dataJadwalJam = dataJadwalUpdate[i];
        const tahapJam = tahapById.get(
          dataJadwalJam.id_tiket_jadwal_produksi_tahapan,
        );
        dataJadwal.push({
          id_tiket_jadwal_produksi: data.id,
          id_mesin: tahapJam ? tahapJam.id_mesin : null,
          item: data.item,
          no_jo: data.no_jo,
          no_booking: data.no_booking,
          qty_pcs: data.qty_pcs,
          qty_druk: data.qty_druk,
          tahapan: dataJadwalJam.tahapan,
          tahapan_ke: dataJadwalJam.tahapan_ke,
          from: dataJadwalJam.from,
          nama_kategori: dataJadwalJam.nama_kategori,
          kategori: dataJadwalJam.kategori,
          kategori_drying_time: dataJadwalJam.kategori_drying_time,
          mesin: dataJadwalJam.mesin,
          kapasitas_per_jam: dataJadwalJam.kapasitas_per_jam,
          drying_time: dataJadwalJam.drying_time,
          setting: dataJadwalJam.setting,
          kapasitas: dataJadwalJam.kapasitas,
          toleransi: dataJadwalJam.toleransi,
          total_waktu: dataJadwalJam.total_waktu,
          tanggal: dataJadwalJam.tanggal,
          jam: dataJadwalJam.jam,
        });
      }

      if (data.type == "jadwal") {
        await TiketJadwalProduksi.update(
          { status_tiket: "history", tgl_masuk_jadwal: new Date() },
          { where: { id: id }, transaction: t },
        );
      } else {
        await TiketJadwalProduksi.update(
          { status_tiket: "penjadwalan", tgl_masuk_jadwal: new Date() },
          { where: { id: id }, transaction: t },
        );
      }

      await JadwalProduksi.bulkCreate(dataJadwal, { transaction: t });
      await t.commit();
      //console.log(data.jadwal_per_jam);
      res.status(200).json({ data: data, tes: dataJadwalUpdate });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  cancelJadwalProduksi: async (req, res) => {
    const { id } = req.params;
    const { note_cancel } = req.body;
    const t = await db.transaction();
    try {
      const data = await TiketJadwalProduksi.findByPk(id, {
        include: [
          {
            model: TiketJadwalProduksiTahapan,
            as: "tahap",
            include: [
              {
                model: TiketJadwalProduksiPerJam,
                as: "jadwal_per_jam",
              },
            ],
          },
          {
            model: TiketJadwalProduksiPerJam,
            as: "jadwal_per_jam",
            separate: true,
            order: [
              ["tanggal", "ASC"], // Urutkan berdasarkan tanggal (terlama ke terbaru)
              ["jam", "ASC"], // Jika tanggal sama, urutkan berdasarkan jam (terlama ke terbaru)
            ],
          },
        ],
      });

      if (!data) return res.status(404).json({ msg: "data tidak ditemukana" });

      await TiketJadwalProduksi.update(
        {
          status_tiket: "canceled",
          note_cancel: note_cancel,
          tgl_cancel: new Date(),
        },
        { where: { id: id }, transaction: t },
      );

      await TiketJadwalProduksiPerJam.destroy({
        where: { id_tiket_jadwal_produksi: id },
        transaction: t,
      });

      if (data.status_tiket == "history") {
        await JadwalProduksi.destroy({
          where: { no_jo: data.no_jo },
          transaction: t,
        });
      }

      let dataJadwal = [];

      await t.commit();
      //console.log(data.jadwal_per_jam);
      res.status(200).json({ status_code: 200, message: "cancel success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  checkExpiredDateBooking: async (req, res) => {
    const t = await db.transaction();
    try {
      const startDate = new Date().setHours(0, 0, 0, 0);
      const endDate = new Date().setHours(23, 59, 59, 999);
      const data = await TiketJadwalProduksi.findAll({
        where: {
          tgl_mulai_produksi: { [Op.between]: [startDate, endDate] },
          no_jo: null,
        },
      });

      for (let i = 0; i < data.length; i++) {
        const element = data[i];
        await TiketJadwalProduksi.update(
          { status_tiket: "expired" },
          { where: { id: element.id }, transaction: t },
        );
        if (element.status_tiket == "history") {
          await JadwalProduksi.destroy({
            where: { no_booking: element.no_booking },
            transaction: t,
          });
        }
      }

      await t.commit();
      //console.log(data.jadwal_per_jam);
      res.status(200).json({ msg: "success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },
};

const formatDateNow = (date) => {
  const options = {
    timeZone: "Asia/Jakarta", // Ganti dengan zona waktu Anda
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("id-ID", options);
  return formatter
    .format(date)
    .replace(",", "")
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$2-$1");
};

const formatNowDateOnly = (date) => {
  const options = {
    timeZone: "Asia/Jakarta", // Ganti dengan zona waktu Anda
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("id-ID", options);
  return formatter
    .format(date)
    .replace(",", "")
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$2-$1");
};

const formatNowTimeOnly = (date) => {
  const options = {
    timeZone: "Asia/Jakarta", // Ganti dengan zona waktu Anda
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const formatter = new Intl.DateTimeFormat("id-ID", options);
  return formatter.format(date).replace(/\./g, ":");
};

// Helper function to check if a date is a holiday
const isHoliday = (date, holidaySet) => {
  const formattedDate = date.toISOString().split("T")[0];
  return holidaySet.has(formattedDate);
};

// Helper function to get shift schedule for a given date
const getShiftSchedule = (date, shift) => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const dayName = days[date.getDay()];
  return shift.find((shift) => shift.hari === dayName);
};

// Helper function to check if time is within break time
const isBreakTime = (date, schedule) => {
  if (!schedule || !schedule.istirahat || schedule.istirahat.length === 0)
    return false;

  const timeStr = date.toTimeString().slice(0, 8);
  return schedule.istirahat.some(
    (breakTime) => timeStr >= breakTime.dari && timeStr < breakTime.sampai,
  );
};

// Enhanced helper to check if time is within shift hours, considering holidays
// NOTE: fungsi module-level ini (dipakai findNextAvailableSlot /
// resolveScheduleConflicts) punya potensi bug yang sama seperti versi lama
// di dalam calculateTiketJadwalProduksi. Tidak diubah di sini karena kedua
// fungsi tersebut tampaknya tidak dipanggil dari controller manapun di file
// ini - kemungkinan kode lama yang belum dipakai lagi.
const isWithinShiftHours = (date, holidaySet, shift, getLembur) => {
  const schedule = getShiftSchedule(date, shift);
  if (!schedule) return false;

  const getLemburFn = getLembur || (() => ({ shift_1: false, shift_2: false }));
  const lembur = getLemburFn(date);
  const isLemburDay = lembur.shift_1 || lembur.shift_2;

  const timeStr = date.toTimeString().slice(0, 8);
  const currentDate = new Date(date);
  const previousDay = new Date(date);
  previousDay.setDate(date.getDate() - 1);
  const previousSchedule = getShiftSchedule(previousDay, shift);
  const prevLembur = getLemburFn(previousDay);

  if (isBreakTime(date, schedule)) return false;
  if (isHoliday(currentDate, holidaySet) && !isLemburDay) return false;

  // Batasi Sabtu maksimal jam 13:00 (kecuali lembur shift_1 di tanggal itu)
  const isSaturday = date.getDay() === 6;
  if (isSaturday && timeStr >= "13:00:00" && !lembur.shift_1) return false;

  // Shift 1
  const shift1Masuk = lembur.shift_1 ? "08:00:00" : schedule.shift_1_masuk;
  const shift1Keluar = lembur.shift_1 ? "19:00:00" : schedule.shift_1_keluar;
  if (
    shift1Masuk &&
    shift1Keluar &&
    timeStr >= shift1Masuk &&
    timeStr <= shift1Keluar
  ) {
    return true;
  }

  // Shift 2 hari ini (sebelum tengah malam) — tidak berlaku Sabtu
  const shift2Masuk = lembur.shift_2 ? "20:00:00" : schedule.shift_2_masuk;
  if (
    !isSaturday &&
    shift2Masuk &&
    shift2Masuk !== "" &&
    timeStr >= shift2Masuk &&
    timeStr <= "23:59:59"
  ) {
    return true;
  }

  // Shift 2 hari sebelumnya yang melewati tengah malam — tidak berlaku Sabtu
  const prevShift2Keluar = previousSchedule
    ? prevLembur.shift_2
      ? "07:00:00"
      : previousSchedule.shift_2_keluar
    : null;

  if (
    !isSaturday &&
    previousSchedule &&
    prevShift2Keluar &&
    prevShift2Keluar !== "" &&
    timeStr >= "00:00:00" &&
    timeStr <= prevShift2Keluar
  ) {
    return true;
  }

  return false;
};

// Fungsi untuk mengecek apakah slot waktu sudah terpakai
function isSlotOccupied(dataTerjadwal, mesin, tanggal, jam) {
  return dataTerjadwal.some(
    (item) =>
      item.mesin === mesin && item.tanggal === tanggal && item.jam === jam,
  );
}

function findNextAvailableSlot(
  dataTerjadwal,
  mesin,
  startDate,
  startTime,
  jadwalLiburSet,
  dataShift,
) {
  let currentDate = new Date(startDate);
  let currentHour = parseInt(startTime.split(":")[0]);
  currentDate.setHours(currentHour, 0, 0, 0);

  while (true) {
    const dateStr = formatNowDateOnly(currentDate);
    const timeStr = formatNowTimeOnly(currentDate);

    if (isWithinShiftHours(currentDate, jadwalLiburSet, dataShift)) {
      if (!isSlotOccupied(dataTerjadwal, mesin, dateStr, timeStr)) {
        return {
          tanggal: dateStr,
          jam: timeStr,
          date: new Date(currentDate),
        };
      }
    }

    // ✅ mundur ke belakang, bukan maju ke depan
    currentDate.setHours(currentDate.getHours() - 1);
  }
}

// Fungsi untuk menyelesaikan konflik jadwal
function resolveScheduleConflicts(
  listJadwalPerJam,
  dataTerjadwal,
  jadwalLiburSet,
  dataShift,
) {
  let allScheduledData = [...dataTerjadwal];
  let resolvedSchedule = [];

  for (let i = 0; i < listJadwalPerJam.length; i++) {
    const currentItem = listJadwalPerJam[i];

    if (
      isSlotOccupied(
        allScheduledData,
        currentItem.mesin,
        currentItem.tgl,
        currentItem.jam,
      )
    ) {
      const nextSlot = findNextAvailableSlot(
        allScheduledData,
        currentItem.mesin,
        currentItem.tgl,
        currentItem.jam,
        jadwalLiburSet,
        dataShift,
      );

      currentItem.tgl = nextSlot.tanggal;
      currentItem.jam = nextSlot.jam;

      // ✅ update item berikutnya dalam tahapan yang sama, mundur ke belakang
      for (let j = i + 1; j < listJadwalPerJam.length; j++) {
        if (
          listJadwalPerJam[j].tahapan === currentItem.tahapan &&
          listJadwalPerJam[j].mesin === currentItem.mesin
        ) {
          // mundur 1 jam dari slot yang baru ditemukan
          nextSlot.date.setHours(nextSlot.date.getHours() - 1);

          const nextNextSlot = findNextAvailableSlot(
            allScheduledData,
            listJadwalPerJam[j].mesin,
            formatNowDateOnly(nextSlot.date),
            formatNowTimeOnly(nextSlot.date),
            jadwalLiburSet,
            dataShift,
          );

          listJadwalPerJam[j].tgl = nextNextSlot.tanggal;
          listJadwalPerJam[j].jam = nextNextSlot.jam;
          nextSlot.date = nextNextSlot.date;
        }
      }
    }

    allScheduledData.push({
      mesin: currentItem.mesin,
      tanggal: currentItem.tgl,
      jam: currentItem.jam,
    });

    resolvedSchedule.push(currentItem);
  }

  return resolvedSchedule;
}
module.exports = jadwalProduksiController;
