const { Op, Sequelize } = require("sequelize");
const JadwalKaryawan = require("../../model/hr/jadwalKaryawan/jadwalKaryawanModel");

const moment = require("moment");

const jadwalProduksiController = {
  getTiketJadwalProduksi: async (req, res) => {
    try {
      const { status, tgl, mesin, page, limit, search } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      if (id) {
        const dataById = dataDumyJo.find((data) => data.id == id);
        res.status(200).json({ data: dataById });
      } else {
        res.status(200).json({ data: dataDumyJo });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  calculateTiketJadwalProduksi: async (req, res) => {
    try {
      const { id } = req.params;
      const dataById = dataDumyJo.find((data) => data.id == id);

      const dataJadwal = await JadwalKaryawan.findAll({
        order: [["createdAt", "DESC"]],

        where: {
          tanggal: {
            [Op.between]: [
              new Date().setHours(0, 0, 0, 0),
              new Date(dataById.tgl_kirim).setHours(23, 59, 59, 999),
            ],
          },
          jenis_karyawan: "produksi",
        },
      });

      // Jadwal libur
      let jadwalLibur = [
        "2024-12-25", // Hari Natal
        "2024-12-01", // Minggu
        "2024-12-08", // Minggu
        "2024-12-15", // Minggu
        "2024-12-22", // Minggu
        "2025-01-19", // Minggu
      ];
      // dataJadwal.map((data) => jadwalLibur.push(data.tanggal));

      // Format jadwal libur menjadi Date untuk perbandingan
      const jadwalLiburSet = new Set(
        jadwalLibur.map((date) => new Date(date).toISOString().split("T")[0])
      );
      console.log(jadwalLiburSet);

      // Fungsi untuk mengurangi tanggal dan melewati tanggal libur
      const decrementDate = (date, days) => {
        while (days > 0) {
          date.setDate(date.getDate() - 1);
          const formattedDate = date.toISOString().split("T")[0];
          if (!jadwalLiburSet.has(formattedDate)) {
            days--;
          }
        }
        return date;
      };

      dataById.tahap.forEach((tahap) => {
        // Hitung kapasitas
        if (tahap.from === "druk" && tahap.kapasitas_per_jam != 0) {
          tahap.kapasitas = dataById.qty_druk / tahap.kapasitas_per_jam;
        } else if (tahap.from === "pcs" && tahap.kapasitas_per_jam != 0) {
          tahap.kapasitas = dataById.qty_pcs / tahap.kapasitas_per_jam;
        } else {
          tahap.kapasitas = 0; // Jika tidak relevan
        }

        // Hitung total waktu
        tahap.total_waktu = tahap.drying_time + tahap.setting + tahap.kapasitas;
      });

      const tgl_kirim = dataById.tgl_kirim;
      const tahap = dataById.tahap;

      const tglKirim = new Date(tgl_kirim);
      let currentDate = new Date(tgl_kirim);
      let firstTglInSequence = null;

      for (let i = tahap.length - 1; i >= 0; i--) {
        const stage = tahap[i];

        if (i === tahap.length - 1) {
          // Tahapan terakhir selalu menggunakan tgl_kirim asli
          stage.tgl_from = formatDateNow(tglKirim);
          stage.tgl_to = formatDateNow(tglKirim);
          continue;
        }

        // Set tgl_to
        stage.tgl_to = formatDateNow(currentDate);

        if (stage.from === "tgl") {
          if (firstTglInSequence) {
            // If in a sequence, align with the first "tgl"
            stage.tgl_from = firstTglInSequence.tgl_from;
            stage.tgl_to = firstTglInSequence.tgl_to;
          } else {
            // Otherwise, calculate and set as the first in sequence
            firstTglInSequence = stage;
            currentDate = decrementDate(currentDate, 2); // Kurangi 2 hari (lewati libur)
            stage.tgl_from = formatDateNow(currentDate);
          }
        } else {
          // Reset the sequence tracker for non-"tgl" stages
          firstTglInSequence = null;

          // Handle "druk" and "pcs" logic
          if (stage.from === "druk" || stage.from === "pcs") {
            currentDate.setHours(currentDate.getHours() - stage.total_waktu); // Gunakan total_waktu untuk kalkulasi
          }

          // Set tgl_from
          stage.tgl_from = formatDateNow(currentDate);
        }
      }

      res.status(200).json({ data: dataById });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  calculateTiketJadwalProduksiDua: async (req, res) => {
    try {
      const { id } = req.params;
      const dataById = dataDumyJo.find((data) => data.id == id);

      // const dataJadwal = await JadwalKaryawan.findAll({
      //   order: [["createdAt", "DESC"]],
      //   where: {
      //     tanggal: {
      //       [Op.between]: [
      //         new Date().setHours(0, 0, 0, 0),
      //         new Date(dataById.tgl_kirim).setHours(23, 59, 59, 999),
      //       ],
      //     },
      //     jenis_karyawan: "produksi",
      //   },
      // });

      // Jadwal libur
      let jadwalLibur = [
        "2024-12-25",
        "2024-12-01",
        "2024-12-08",
        "2024-12-15",
        "2024-12-22",
        "2025-01-19",
      ];
      const jadwalLiburSet = new Set(
        jadwalLibur.map((date) => new Date(date).toISOString().split("T")[0])
      );

      const decrementDate = (date, days) => {
        while (days > 0) {
          date.setDate(date.getDate() - 1);
          const formattedDate = date.toISOString().split("T")[0];
          if (!jadwalLiburSet.has(formattedDate)) {
            days--;
          }
        }
        return date;
      };

      dataById.tahap.forEach((tahap) => {
        if (tahap.from === "druk" && tahap.kapasitas_per_jam != 0) {
          tahap.kapasitas = dataById.qty_druk / tahap.kapasitas_per_jam;
        } else if (tahap.from === "pcs" && tahap.kapasitas_per_jam != 0) {
          tahap.kapasitas = dataById.qty_pcs / tahap.kapasitas_per_jam;
        } else {
          tahap.kapasitas = 0;
        }

        tahap.total_waktu = tahap.drying_time + tahap.setting + tahap.kapasitas;
      });

      const tgl_kirim = dataById.tgl_kirim;
      const tahap = dataById.tahap;

      const tglKirim = new Date(tgl_kirim);
      let currentDate = new Date(tgl_kirim);
      let firstTglInSequence = null;

      // Tempat untuk menyimpan list jadwal per jam
      let listJadwalPerJam = [];

      for (let i = tahap.length - 1; i >= 0; i--) {
        const stage = tahap[i];

        if (i === tahap.length - 1) {
          // Tahapan terakhir selalu menggunakan tgl_kirim asli
          stage.tgl_from = formatDateNow(tglKirim);
          stage.tgl_to = formatDateNow(tglKirim);
          continue;
        }

        // Set tgl_to
        stage.tgl_to = formatDateNow(currentDate);

        if (stage.from === "tgl") {
          if (firstTglInSequence) {
            stage.tgl_from = firstTglInSequence.tgl_from;
            stage.tgl_to = firstTglInSequence.tgl_to;
          } else {
            firstTglInSequence = stage;
            currentDate = decrementDate(currentDate, 2);
            stage.tgl_from = formatDateNow(currentDate);
          }
        } else {
          firstTglInSequence = null;

          // Handle "druk" and "pcs" logic
          if (stage.from === "druk" || stage.from === "pcs") {
            // Mengurangi waktu sesuai total_waktu
            for (let j = 0; j < stage.total_waktu; j++) {
              listJadwalPerJam.push({
                item: stage.item,
                no_jo: dataById.no_jo,
                qty_pcs: dataById.qty_pcs,
                qty_druk: dataById.qty_druk,
                tahapan: stage.tahapan,
                from: stage.from,
                nama_kategori: stage.nama_kategori,
                kategori: stage.kategori,
                kategori_drying_time: stage.kategory_drying_time,
                mesin: stage.mesin,
                kapasitas_per_jam: stage.kapasitas_per_jam,
                drying_time: stage.drying_time,
                seting: stage.setting,
                kapasitas: stage.kapasitas,
                toleransi: stage.toleransi,
                total_waktu: stage.total_waktu,
                tgl: formatNowDateOnly(currentDate),
                jam: formatNowTimeOnly(currentDate),
              });
              currentDate.setHours(currentDate.getHours() - 1);
            }
          }

          stage.tgl_from = formatDateNow(currentDate);
        }
      }

      // Menambahkan list jadwal per jam ke dalam data tahap
      dataById.tahap.forEach((stage, index) => {
        stage.listJadwalPerJam = listJadwalPerJam.filter(
          (jadwal) => jadwal.tahapan === stage.tahapan
        );
      });

      res.status(200).json({ data: dataById });
    } catch (err) {
      res.status(500).json({ msg: err.message });
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
  return formatter
    .format(date)
    .replace(",", "")
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$2-$1");
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
];

// Data shift untuk setiap hari
const shiftHarian = [
  {
    hari: "Senin",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
  },
  {
    hari: "Selasa",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
  },
  {
    hari: "Rabu",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
  },
  {
    hari: "Kamis",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
  },
  {
    hari: "Jumat",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "16:00:00",
    shift_2_masuk: "20:00:00",
    shift_2_keluar: "04:00:00",
  },
  {
    hari: "Sabtu",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "13:00:00",
    shift_2_masuk: "22:00:00",
    shift_2_keluar: "04:00:00",
    istirahat: [],
  },
  {
    hari: "Minggu",
    shift_1_masuk: "08:00:00",
    shift_1_keluar: "13:00:00",
    shift_2_masuk: "22:00:00",
    shift_2_keluar: "06:00:00",
    istirahat: [],
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

module.exports = jadwalProduksiController;
