const { Op, Sequelize } = require("sequelize");

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
            currentDate.setDate(currentDate.getDate() - 2); // You can adjust this as needed
            stage.tgl_from = formatDateNow(currentDate);
          }
        } else {
          // Reset the sequence tracker for non-"tgl" stages
          firstTglInSequence = null;

          // Handle "druk" and "pcs" logic
          if (stage.from === "druk" || stage.from === "pcs") {
            currentDate.setHours(currentDate.getHours() - stage.total_waktu); // Use total_waktu for calculation
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

  const formatter = new Intl.DateTimeFormat("en-GB", options);
  return formatter
    .format(date)
    .replace(",", "")
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$2-$1");
};

const dataDumyJo = [
  {
    id: 1,
    item: "Jago Bar",
    jo: "24-00001",
    tgl_kirim: "24 October 2024",
    tgl_cetak: "07 October 2024",
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

  {
    id: 2,
    item: "Bolu bakar",
    jo: "24-00003",
    tgl_kirim: "30 October 2024",
    tgl_cetak: "07 October 2024",
    qty_pcs: 50000,
    qty_druk: 25700,
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
        mesin: "SM",
        kapasitas_per_jam: 1500,
        drying_time: 48,
        setting: 3,
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
        mesin: "OUTSORCE",
        kapasitas_per_jam: 500,
        drying_time: 48,
        setting: 0,
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
        mesin: "MANUAL",
        kapasitas_per_jam: 0,
        drying_time: 24,
        setting: 2,
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
        kapasitas_per_jam: 2000,
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
        kapasitas_per_jam: 2000,
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
        mesin: "MANUAL",
        kapasitas_per_jam: 200,
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
];

const shifts = [
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
        createdAt: "2024-12-13T02:55:25.000Z",
        updatedAt: "2024-12-13T02:55:25.000Z",
      },
      {
        id: 7,
        id_shift: "Senin",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Senin",
        createdAt: "2024-12-17T02:40:23.000Z",
        updatedAt: "2024-12-17T02:40:23.000Z",
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
        id: 2,
        id_shift: "Selasa",
        dari: "12:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Selasa",
        createdAt: "2024-12-13T02:55:25.000Z",
        updatedAt: "2024-12-13T02:55:25.000Z",
      },
      {
        id: 6,
        id_shift: "Selasa",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Selasa",
        createdAt: "2024-12-17T02:40:23.000Z",
        updatedAt: "2024-12-17T02:40:23.000Z",
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
        id: 3,
        id_shift: "Rabu",
        dari: "12:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Rabu",
        createdAt: "2024-12-17T02:39:13.000Z",
        updatedAt: "2024-12-17T02:39:13.000Z",
      },
      {
        id: 8,
        id_shift: "Rabu",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Rabu",
        createdAt: "2024-12-17T02:41:14.000Z",
        updatedAt: "2024-12-17T02:41:14.000Z",
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
        id: 4,
        id_shift: "Kamis",
        dari: "12:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1 Kamis",
        createdAt: "2024-12-17T02:39:13.000Z",
        updatedAt: "2024-12-17T02:39:13.000Z",
      },
      {
        id: 9,
        id_shift: "Kamis",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Rabu",
        createdAt: "2024-12-17T02:41:14.000Z",
        updatedAt: "2024-12-17T02:41:14.000Z",
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
        id: 5,
        id_shift: "Jumat",
        dari: "11:00:00",
        sampai: "13:00:00",
        nama: "Istirahat 1",
        createdAt: "2024-12-17T02:39:13.000Z",
        updatedAt: "2024-12-17T02:39:13.000Z",
      },
      {
        id: 10,
        id_shift: "Jumat",
        dari: "18:00:00",
        sampai: "18:30:00",
        nama: "Istirahat 2 Jumat",
        createdAt: "2024-12-17T02:41:35.000Z",
        updatedAt: "2024-12-17T02:41:35.000Z",
      },
    ],
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
    shift_2_keluar: "04:00:00",
    istirahat: [],
  },
];

module.exports = jadwalProduksiController;
