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
        if (tahap.from === "druk") {
          tahap.kapasitas = dataById.qty_druk / tahap.kapasitas_per_jam;
        } else if (tahap.from === "pcs") {
          tahap.kapasitas = dataById.qty_pcs / tahap.kapasitas_per_jam;
        } else {
          tahap.kapasitas = 0; // Jika tidak relevan
        }

        // Hitung total waktu
        tahap.total_waktu = tahap.drying_time + tahap.setting + tahap.kapasitas;
      });

      const tgl_kirim = dataById.tgl_kirim;

      const tahap = dataById.tahap;

      const formatDate = (date) =>
        date.toISOString().replace("T", " ").slice(0, 19);

      const tglKirim = new Date(tgl_kirim);
      console.log(tglKirim);
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
            currentDate.setDate(currentDate.getDate() - 2);
            stage.tgl_from = formatDateNow(currentDate);
          }
        } else {
          // Reset the sequence tracker for non-"tgl" stages
          firstTglInSequence = null;

          // Handle "druk" and "pcs" logic
          if (stage.from === "druk" || stage.from === "pcs") {
            currentDate.setHours(currentDate.getHours() - stage.total_waktu);
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
    tgl_kirim: "24 October 2024",
    tgl_cetak: "07 October 2024",
    qty_pcs: 100000,
    qty_druk: 13100,
    tahap: [
      {
        tahapan: "Potong",
        from: "tgl",
        kategory: "A",
        drying_time: "A",
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
        kategory: "A",
        drying_time: "A",
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
        drying_time: "B",
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
        drying_time: "B",
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
        drying_time: "A",
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
        drying_time: "",
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
        drying_time: "",
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
        drying_time: "A",
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
        drying_time: "",
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
        drying_time: "",
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
        drying_time: "",
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
        drying_time: "",
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

module.exports = jadwalProduksiController;
