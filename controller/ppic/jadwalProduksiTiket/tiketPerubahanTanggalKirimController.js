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

const moment = require("moment");

const PerubahanTanggalKirimController = {
  // getTiketJadwalProduksi: async (req, res) => {
  //   try {
  //     const { status, tgl, mesin, page, limit, search } = req.query;
  //     const { id } = req.params;
  //     const offset = (parseInt(page) - 1) * parseInt(limit);
  //     if (id) {
  //       const dataById = dataDumyJo.find((data) => data.id == id);
  //       res.status(200).json({ data: dataById });
  //     } else {
  //       res.status(200).json({ data: dataDumyJo });
  //     }
  //   } catch (err) {
  //     res.status(500).json({ msg: err.message });
  //   }
  // },
  getTiketJadwalPerubahanTanggalKirim: async (req, res) => {
    try {
      const {
        status,
        status_tiket,
        start_date,
        end_date,
        no_booking,
        page,
        limit,
      } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};

      if (status) obj.status = status;
      if (status_tiket) obj.status_tiket = status_tiket;
      if (no_booking) obj.no_booking = no_booking;
      if (start_date && end_date) {
        obj.createdAt = {
          [Op.between]: [
            new Date(start_date).setHours(0, 0, 0, 0),
            new Date(end_date).setHours(23, 59, 59, 999),
          ],
        };
      }

      if (page && limit) {
        const length = await TiketPerubahanTanggalKirim.count({ where: obj });
        const data = await TiketPerubahanTanggalKirim.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          limit: parseInt(limit),
          offset,
          include: [
            {
              model: TiketJadwalProduksi,
              as: "tiket",
            },
          ],
        });

        return res.status(200).json({
          status_code: 200,
          success: true,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await TiketPerubahanTanggalKirim.findByPk(id, {
          include: [
            {
              model: TiketJadwalProduksi,
              as: "tiket",
            },
          ],
        });
        res.status(200).json({ status_code: 200, success: true, data: data });
      } else {
        const data = await TiketPerubahanTanggalKirim.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });

        res.status(200).json({ status_code: 200, success: true, data: data });
      }
    } catch (err) {
      res
        .status(500)
        .json({ status_code: 500, success: false, msg: err.message });
    }
  },

  createTiketJadwalPerubahanTanggalKirim: async (req, res) => {
    const { id_tiket, tgl_kirim } = req.body;
    const t = await db.transaction();

    try {
      console.log(1);
      const data = await TiketJadwalProduksi.findByPk(id_tiket);

      if (!data)
        return res.status(404).json({
          status_code: 404,
          success: false,
          msg: "data tidak ditemukana",
        });

      const date = new Date(tgl_kirim);

      await TiketPerubahanTanggalKirim.create(
        {
          id_tiket_jadwal_produksi: id_tiket,
          no_booking: data.no_booking,
          from_tgl: data.tgl_kirim_date,
          to_tgl: date,
        },
        { transaction: t }
      );

      await t.commit();
      res
        .status(200)
        .json({ status_code: 200, success: true, msg: "create success" });
    } catch (err) {
      await t.rollback();
      res
        .status(500)
        .json({ status_code: 500, success: false, msg: err.message });
    }
  },

  approveTiketJadwalPerubahanTanggalKirim: async (req, res) => {
    const { id } = req.params;
    const { nama_approval } = req.body;
    const t = await db.transaction();
    try {
      const dataTiket = await TiketPerubahanTanggalKirim.findByPk(id);

      if (!dataTiket)
        return res.status(404).json({
          status_code: 404,
          success: false,
          msg: "data tidak ditemukan",
        });

      const dataTiketJadwal = await TiketJadwalProduksi.findByPk(
        dataTiket.id_tiket_jadwal_produksi
      );
      if (!dataTiketJadwal)
        return res.status(404).json({
          status_code: 404,
          success: false,
          msg: "data jadwal produksi tidak ditemukan",
        });

      await TiketJadwalProduksiPerJam.destroy({
        where: { id_tiket_jadwal_produksi: dataTiketJadwal.id },
        transaction: t,
      });

      if (dataTiket.status_tiket == "history") {
        await JadwalProduksi.destroy({
          where: { no_booking: dataTiketJadwal.no_booking },
          transaction: t,
        });
      }

      await TiketJadwalProduksi.update(
        {
          status_tiket: "incoming",
          status: "non calculated",
          tgl_masuk_jadwal: null,
          tgl_mulai_produksi: null,
        },
        { where: { id: dataTiketJadwal.id }, transaction: t }
      );
      await TiketPerubahanTanggalKirim.update(
        {
          nama_approval: nama_approval,
          status: "approved",
          status_tiket: "history",
        },
        { where: { id: id }, transaction: t }
      );

      await t.commit();

      res
        .status(200)
        .json({ status_code: 200, success: true, msg: "approve success" });
    } catch (err) {
      res
        .status(500)
        .json({ status_code: 500, success: false, msg: err.message });
    }
  },

  rejectTiketJadwalPerubahanTanggalKirim: async (req, res) => {
    const { id } = req.params;
    const { nama_approval } = req.body;
    const t = await db.transaction();
    try {
      const dataTiket = await TiketPerubahanTanggalKirim.findByPk(id);

      if (!dataTiket)
        return res.status(404).json({
          status_code: 404,
          success: false,
          msg: "data tidak ditemukan",
        });

      const dataTiketJadwal = await TiketJadwalProduksi.findByPk(
        dataTiket.id_tiket_jadwal_produksi
      );
      if (!dataTiketJadwal)
        return res.status(404).json({
          status_code: 404,
          success: false,
          msg: "data jadwal produksi tidak ditemukan",
        });

      if (dataTiket.status_tiket == "history") {
        await JadwalProduksi.destroy({
          where: { no_booking: dataTiketJadwal.no_booking },
          transaction: t,
        });
      }

      await TiketJadwalProduksi.update(
        {
          status_tiket: "expired",
          status: "calculated",
        },
        { where: { id: dataTiketJadwal.id }, transaction: t }
      );

      await TiketPerubahanTanggalKirim.update(
        {
          nama_approval: nama_approval,
          status: "rejected",
          status_tiket: "history",
        },
        { where: { id: id }, transaction: t }
      );

      await t.commit();

      res
        .status(200)
        .json({ status_code: 200, success: true, msg: "reject success" });
    } catch (err) {
      res
        .status(500)
        .json({ status_code: 500, success: false, msg: err.message });
    }
  },
};

// function formatDateNow(date) {
//   return (
//     date.toISOString().split("T")[0] +
//     " " +
//     date.toISOString().split("T")[1].split(".")[0]
//   );
// }

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
    (breakTime) => timeStr >= breakTime.dari && timeStr < breakTime.sampai
  );
};

// Enhanced helper to check if time is within shift hours, considering holidays
const isWithinShiftHours = (date, holidaySet, shift) => {
  const schedule = getShiftSchedule(date, shift);
  if (!schedule) return false;

  const timeStr = date.toTimeString().slice(0, 8);
  const currentDate = new Date(date);
  const previousDay = new Date(date);
  previousDay.setDate(date.getDate() - 1);
  const previousSchedule = getShiftSchedule(previousDay, shift);

  // Skip if time is within break time
  if (isBreakTime(date, schedule)) return false;

  // Scenario 1: If today is a holiday, skip to the next valid workday
  if (isHoliday(currentDate, holidaySet)) {
    return false;
  }

  // Scenario 2: Regular shift 1 check
  if (timeStr >= schedule.shift_1_masuk && timeStr <= schedule.shift_1_keluar) {
    return true;
  }

  // Scenario 3: Current day shift 2 check (before midnight)
  if (
    schedule.shift_2_masuk &&
    schedule.shift_2_masuk !== "" &&
    timeStr >= schedule.shift_2_masuk &&
    timeStr <= "23:59:59"
  ) {
    return true;
  }

  // Scenario 4: Previous day's shift 2 extending into current day (after midnight)
  if (
    previousSchedule &&
    previousSchedule.shift_2_keluar &&
    previousSchedule.shift_2_keluar !== "" &&
    timeStr >= "00:00:00" &&
    timeStr <= previousSchedule.shift_2_keluar
  ) {
    return true;
  }

  return false;
};

// Jadwal libur
const jadwalLibur = [
  "2024-12-25", // Hari Natal
  "2024-12-01", // Minggu
  "2024-12-08", // Minggu
  "2024-12-15", // Minggu
  "2024-12-22", // Minggu
  "2025-01-09", // Minggu
  "2025-01-11", // Minggu
  "2025-01-19", // Minggu
  "2025-03-25", // Minggu
];

// Data shift untuk setiap hari
const shiftHarian = [
  {
    hari: "Senin",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
    istirahat: [
      {
        id: 1,
        id_shift: "Senin",
        dari: "12:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Senin",
      },
      {
        id: 7,
        id_shift: "Senin",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Senin",
      },
    ],
  },
  {
    hari: "Selasa",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
    istirahat: [
      {
        id: 1,
        id_shift: "Selasa",
        dari: "12:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Selasa",
      },
    ],
  },
  {
    hari: "Rabu",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
    istirahat: [
      {
        id: 1,
        id_shift: "Rabu",
        dari: "12:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Rabu",
      },
      {
        id: 7,
        id_shift: "Rabu",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Rabu",
      },
    ],
  },
  {
    hari: "Kamis",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
    istirahat: [
      {
        id: 1,
        id_shift: "Kamis",
        dari: "12:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Kamis",
      },
      {
        id: 7,
        id_shift: "Kamis",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Kamis",
      },
    ],
  },
  {
    hari: "Jumat",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
    istirahat: [
      {
        id: 1,
        id_shift: "Jumat",
        dari: "11:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Jumat",
      },
      {
        id: 7,
        id_shift: "Jumat",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Jumat",
      },
    ],
  },
  {
    hari: "Sabtu",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "13:00:00",
    shift_2_masuk: "",
    shift_2_keluar: "",
    istirahat: [
      {
        id: 1,
        id_shift: "Sabtu",
        dari: "12:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Sabtu",
      },
    ],
  },
];

const dataDumyJo = [
  {
    id: 1,
    item: "Jago Bar",
    jo: "24-00001",
    tgl_kirim: "24 January 2025",
    tgl_cetak: "07 January 2025",
    qty_pcs: 100000,
    qty_druk: 13100,
    tahap: [
      {
        tahapan: "Potong",
        from: "tgl",
        kategory: "",
        kategory_drying_time: "",
        mesin: "ITOH",
        kapasitas_per_jam: 0,
        drying_time: 0,
        setting: 0,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Plate",
        from: "tgl",
        kategory: "",
        kategory_drying_time: "",
        mesin: "CTP",
        kapasitas_per_jam: 0,
        drying_time: 0,
        setting: 0,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Cetak",
        from: "druk",
        kategory: "B",
        kategory_drying_time: "B",
        mesin: "R700",
        kapasitas_per_jam: 2500,
        drying_time: 48,
        setting: 2,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Coating",
        from: "druk",
        kategory: "A",
        kategory_drying_time: "B",
        mesin: "Hock",
        kapasitas_per_jam: 2500,
        drying_time: 48,
        setting: 1.5,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Pond",
        from: "druk",
        kategory: "B",
        kategory_drying_time: "A",
        mesin: "BOADER",
        kapasitas_per_jam: 2000,
        drying_time: 24,
        setting: 3,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Rabut",
        from: "pcs",
        kategory: "",
        kategory_drying_time: "",
        mesin: "MANUAL",
        kapasitas_per_jam: 6000,
        drying_time: 0,
        setting: 0,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Sortir",
        from: "pcs",
        kategory: "",
        kategory_drying_time: "",
        mesin: "MANUAL",
        kapasitas_per_jam: 6000,
        drying_time: 0,
        setting: 0,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Lem",
        from: "pcs",
        kategory: "B",
        kategory_drying_time: "A",
        mesin: "JK-1000",
        kapasitas_per_jam: 4000,
        drying_time: 24,
        setting: 3,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Sampling",
        from: "tgl",
        kategory: "",
        kategory_drying_time: "",
        mesin: "MANUAL",
        kapasitas_per_jam: 0,
        drying_time: 0,
        setting: 0,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Packing",
        from: "tgl",
        kategory: "",
        kategory_drying_time: "",
        mesin: "MANUAL",
        kapasitas_per_jam: 0,
        drying_time: 0,
        setting: 0,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Final Inspection",
        from: "tgl",
        kategory: "",
        kategory_drying_time: "",
        mesin: "MANUAL",
        kapasitas_per_jam: 0,
        drying_time: 0,
        setting: 0,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
      {
        tahapan: "Kirim",
        from: "tgl",
        kategory: "",
        kategory_drying_time: "",
        mesin: "MANUAL",
        kapasitas_per_jam: 0,
        drying_time: 0,
        setting: 0,
        kapasitas: 0,
        toleransi: 0,
        total_waktu: 0,
        tgl_from: "",
        tgl_to: "",
      },
    ],
  },

  // {
  //   id: 2,
  //   item: "Bolu bakar",
  //   jo: "24-00003",
  //   tgl_kirim: "30 October 2024",
  //   tgl_cetak: "07 October 2024",
  //   qty_pcs: 50000,
  //   qty_druk: 25700,
  //   tahap: [
  //     {
  //       tahapan: "Potong",
  //       from: "tgl",
  //       kategory: "",
  //       kategory_drying_time: "",
  //       mesin: "ITOH",
  //       kapasitas_per_jam: 0,
  //       drying_time: 0,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Plate",
  //       from: "tgl",
  //       kategory: "",
  //       kategory_drying_time: "",
  //       mesin: "CTP",
  //       kapasitas_per_jam: 0,
  //       drying_time: 0,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Cetak",
  //       from: "druk",
  //       kategory: "B",
  //       kategory_drying_time: "B",
  //       mesin: "SM",
  //       kapasitas_per_jam: 1500,
  //       drying_time: 48,
  //       setting: 3,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Coating",
  //       from: "druk",
  //       kategory: "A",
  //       kategory_drying_time: "B",
  //       mesin: "OUTSORCE",
  //       kapasitas_per_jam: 500,
  //       drying_time: 48,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Pond",
  //       from: "druk",
  //       kategory: "B",
  //       kategory_drying_time: "A",
  //       mesin: "MANUAL",
  //       kapasitas_per_jam: 0,
  //       drying_time: 24,
  //       setting: 2,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Rabut",
  //       from: "pcs",
  //       kategory: "",
  //       kategory_drying_time: "",
  //       mesin: "MANUAL",
  //       kapasitas_per_jam: 2000,
  //       drying_time: 0,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Sortir",
  //       from: "pcs",
  //       kategory: "",
  //       kategory_drying_time: "",
  //       mesin: "MANUAL",
  //       kapasitas_per_jam: 2000,
  //       drying_time: 0,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Lem",
  //       from: "pcs",
  //       kategory: "B",
  //       kategory_drying_time: "A",
  //       mesin: "MANUAL",
  //       kapasitas_per_jam: 200,
  //       drying_time: 24,
  //       setting: 3,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Sampling",
  //       from: "tgl",
  //       kategory: "",
  //       kategory_drying_time: "",
  //       mesin: "MANUAL",
  //       kapasitas_per_jam: 0,
  //       drying_time: 0,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Packing",
  //       from: "tgl",
  //       kategory: "",
  //       kategory_drying_time: "",
  //       mesin: "MANUAL",
  //       kapasitas_per_jam: 0,
  //       drying_time: 0,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Final Inspection",
  //       from: "tgl",
  //       kategory: "",
  //       kategory_drying_time: "",
  //       mesin: "MANUAL",
  //       kapasitas_per_jam: 0,
  //       drying_time: 0,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //     {
  //       tahapan: "Kirim",
  //       from: "tgl",
  //       kategory: "",
  //       kategory_drying_time: "",
  //       mesin: "MANUAL",
  //       kapasitas_per_jam: 0,
  //       drying_time: 0,
  //       setting: 0,
  //       kapasitas: 0,
  //       toleransi: 0,
  //       total_waktu: 0,
  //       tgl_from: "",
  //       tgl_to: "",
  //     },
  //   ],
  // },
];

module.exports = PerubahanTanggalKirimController;
