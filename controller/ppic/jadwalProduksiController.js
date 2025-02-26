const { Op, Sequelize, where } = require("sequelize");
const JadwalKaryawan = require("../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const TiketJadwalProduksi = require("../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiModel");
const TiketJadwalProduksiTahapan = require("../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiTahapanModel");
const TiketJadwalProduksiPerJam = require("../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiPerJamModel");
const JadwalProduksi = require("../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const masterShift = require("../../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../../model/masterData/hr/masterShift/masterIstirahatModel");

const db = require("../../config/database");

const moment = require("moment");

const jadwalProduksiController = {
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
  getTiketJadwalProduksi: async (req, res) => {
    try {
      const { status, status_tiket, tgl, page, limit, search } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (status) obj.status = status;
      if (status_tiket) obj.status_tiket = status_tiket;
      if (tgl) obj.tgl = tgl;

      if (page && limit) {
        const length = await TiketJadwalProduksi.count({ where: obj });
        const data = await TiketJadwalProduksi.findAll({
          where: obj,
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
        });

        return res.status(200).json({
          data: data,
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
          ],
        });
        res.status(200).json({ data: data });
      } else {
        const data = await TiketJadwalProduksi.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
        });
        res.status(200).json({ data: data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  createTiketJadwalProduksi: async (req, res) => {
    const { item, no_jo, tgl_kirim, tgl_cetak, qty_pcs, qty_druk, tahap } =
      req.body;
    const t = await db.transaction();

    try {
      const dataTiket = await TiketJadwalProduksi.create(
        {
          item,
          no_jo,
          tgl_kirim,
          tgl_cetak,
          qty_pcs,
          qty_druk,
        },
        { transaction: t }
      );
      let dataTahapan = [];
      for (let i = 0; i < tahap.length; i++) {
        const data = tahap[i];
        let fromData = "";

        if (
          data.tahapan === "Potong" ||
          data.tahapan === "Plate" ||
          data.tahapan === "Sampling" ||
          data.tahapan === "Packing" ||
          data.tahapan === "Final Inspection" ||
          data.tahapan === "Kirim"
        ) {
          fromData = "tgl";
        } else if (
          data.tahapan === "Cetak" ||
          data.tahapan === "Coating" ||
          data.tahapan === "Pond"
        ) {
          fromData = "druk";
        } else {
          fromData = "pcs";
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

      await TiketJadwalProduksiTahapan.bulkCreate(dataTahapan, {
        transaction: t,
      });

      await t.commit();
      res.status(200).json({ msg: "create success" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  calculateTiketJadwalProduksi: async (req, res) => {
    const { id } = req.params;
    const t = await db.transaction();
    try {
      const dataTiket = await TiketJadwalProduksi.findByPk(id, {
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
          },
        ],
      });

      if (!dataTiket)
        return res.status(404).json({ msg: "data tidak ditemukan" });
      if (dataTiket.status === "calculated")
        return res.status(404).json({ msg: "data sudah di kalkulasi" });

      const dataById = {
        id: dataTiket.id,
        item: dataTiket.item,
        no_jo: dataTiket.no_jo,
        tgl_kirim: dataTiket.tgl_kirim,
        tgl_cetak: dataTiket.tgl_cetak,
        qty_pcs: dataTiket.qty_pcs,
        qty_druk: dataTiket.qty_druk,
        status: dataTiket.status,
        tahap: [],
      };

      dataTiket.tahap.map((data) => {
        dataById.tahap.push({
          id: data.id,
          id_tiket_jadwal_produksi: data.id_tiket_jadwal_produksi,
          tahapan: data.tahapan,
          tahapan_ke: data.tahapan_ke,
          from: data.from,
          nama_kategori: data.nama_kategori,
          kategori: data.kategori,
          kategori_drying_time: data.kategori_drying_time,
          mesin: data.mesin,
          kapasitas_per_jam: data.kapasitas_per_jam,
          drying_time: data.drying_time,
          setting: data.setting,
          kapasitas: data.kapasitas,
          toleransi: data.toleransi,
          total_waktu: data.total_waktu,
          tgl_from: data.tgl_from,
          tgl_to: data.tgl_to,
          jadwal_per_jam: data.jadwal_per_jam,
          listJadwalPerJam: [],
        });
      });

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
      let firstTglInSequence = null;
      let listJadwalPerJam = [];
      let currentDate = new Date(tgl_kirim);

      for (let i = tahap.length - 1; i >= 0; i--) {
        const stage = tahap[i];

        if (i === tahap.length - 1) {
          stage.tgl_from = formatDateNow(tglKirim);
          stage.tgl_to = formatDateNow(tglKirim);
          continue;
        }

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

          if (stage.from === "druk" || stage.from === "pcs") {
            let remainingHours = stage.total_waktu;

            while (remainingHours > 0) {
              // Check if we should work this hour considering all scenarios
              if (!isWithinShiftHours(currentDate, jadwalLiburSet, dataShift)) {
                currentDate.setHours(currentDate.getHours() - 1);
                continue;
              }

              listJadwalPerJam.push({
                item: dataById.item,
                no_jo: dataById.no_jo,
                qty_pcs: dataById.qty_pcs,
                qty_druk: dataById.qty_druk,
                tahapan: stage.tahapan,
                tahapan_ke: stage.tahapan_ke,
                from: stage.from,
                nama_kategori: stage.nama_kategori,
                kategori: stage.kategori,
                kategori_drying_time: stage.kategori_drying_time,
                mesin: stage.mesin,
                kapasitas_per_jam: stage.kapasitas_per_jam,
                drying_time: stage.drying_time,
                setting: stage.setting,
                kapasitas: stage.kapasitas,
                toleransi: stage.toleransi,
                total_waktu: stage.total_waktu,
                tgl: formatNowDateOnly(currentDate),
                jam: formatNowTimeOnly(currentDate),
              });

              currentDate.setHours(currentDate.getHours() - 1);
              remainingHours--;
            }
          }

          stage.tgl_from = formatDateNow(currentDate);
        }
      }
      // Menambahkan list jadwal per jam ke dalam data tahap
      dataById.tahap.map((stage, index) => {
        stage.listJadwalPerJam = listJadwalPerJam.filter(
          (jadwal) => jadwal.tahapan === stage.tahapan
        );
      });

      await TiketJadwalProduksi.update(
        { status: "calculated" },
        { where: { id: dataById.id }, transaction: t }
      );

      for (let i = 0; i < dataById.tahap.length; i++) {
        const data = dataById.tahap[i];
        await TiketJadwalProduksiTahapan.update(data, {
          where: { id: data.id },
          transaction: t,
        });

        for (let ii = 0; ii < data.listJadwalPerJam.length; ii++) {
          const data2 = data.listJadwalPerJam[ii];
          await TiketJadwalProduksiPerJam.create(
            {
              ...data2,
              item: dataById.item,
              tanggal: data2.tgl,
              id_tiket_jadwal_produksi: dataById.id,
              id_tiket_jadwal_produksi_tahapan: data.id,
            },
            { transaction: t }
          );
        }
      }

      await t.commit();

      res.status(200).json({ data: dataById, jadwalPerJam: listJadwalPerJam });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  calculateTiketJadwalProduksiDua: async (req, res) => {
    const { id } = req.params;
    const t = await db.transaction();
    try {
      const dataTiket = await TiketJadwalProduksi.findByPk(id, {
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
          },
        ],
      });

      if (!dataTiket)
        return res.status(404).json({ msg: "data tidak ditemukan" });
      if (dataTiket.status === "calculated")
        return res.status(404).json({ msg: "data sudah di kalkulasi" });

      const dataById = {
        id: dataTiket.id,
        item: dataTiket.item,
        no_jo: dataTiket.no_jo,
        tgl_kirim: dataTiket.tgl_kirim,
        tgl_cetak: dataTiket.tgl_cetak,
        qty_pcs: dataTiket.qty_pcs,
        qty_druk: dataTiket.qty_druk,
        status: dataTiket.status,
        tahap: [],
      };

      dataTiket.tahap.map((data) => {
        dataById.tahap.push({
          id: data.id,
          id_tiket_jadwal_produksi: data.id_tiket_jadwal_produksi,
          tahapan: data.tahapan,
          tahapan_ke: data.tahapan_ke,
          from: data.from,
          nama_kategori: data.nama_kategori,
          kategori: data.kategori,
          kategori_drying_time: data.kategori_drying_time,
          mesin: data.mesin,
          kapasitas_per_jam: data.kapasitas_per_jam,
          drying_time: data.drying_time,
          setting: data.setting,
          kapasitas: data.kapasitas,
          toleransi: data.toleransi,
          total_waktu: data.total_waktu,
          tgl_from: data.tgl_from,
          tgl_to: data.tgl_to,
          jadwal_per_jam: data.jadwal_per_jam,
          listJadwalPerJam: [],
        });
      });

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
                item: dataById.item,
                no_jo: dataById.no_jo,
                qty_pcs: dataById.qty_pcs,
                qty_druk: dataById.qty_druk,
                tahapan: stage.tahapan,
                tahapan_ke: stage.tahapan_ke,
                from: stage.from,
                nama_kategori: stage.nama_kategori,
                kategori: stage.kategori,
                kategori_drying_time: stage.kategori_drying_time,
                mesin: stage.mesin,
                kapasitas_per_jam: stage.kapasitas_per_jam,
                drying_time: stage.drying_time,
                setting: stage.setting,
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
      dataById.tahap.map((stage, index) => {
        stage.listJadwalPerJam = listJadwalPerJam.filter(
          (jadwal) => jadwal.tahapan === stage.tahapan
        );
      });

      await TiketJadwalProduksi.update(
        { status: "calculated" },
        { where: { id: dataById.id }, transaction: t }
      );

      for (let i = 0; i < dataById.tahap.length; i++) {
        const data = dataById.tahap[i];
        await TiketJadwalProduksiTahapan.update(data, {
          where: { id: data.id },
          transaction: t,
        });

        for (let ii = 0; ii < data.listJadwalPerJam.length; ii++) {
          const data2 = data.listJadwalPerJam[ii];
          await TiketJadwalProduksiPerJam.create(
            {
              ...data2,
              item: dataById.item,
              tanggal: data2.tgl,
              id_tiket_jadwal_produksi: dataById.id,
              id_tiket_jadwal_produksi_tahapan: data.id,
            },
            { transaction: t }
          );
        }
      }

      await t.commit();

      res.status(200).json({ data: dataById, jadwalPerJam: listJadwalPerJam });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  // updateTiketJadwalProduksi: async (req, res) => {
  //   const _id = req.params.id;
  //   const { data_jadwal } = req.body;
  //   const t = await db.transaction();
  //   try {
  //     // Cari data yang akan diubah berdasarkan ID
  //     const dataToUpdate = await TiketJadwalProduksiPerJam.findByPk(_id);

  //     if (!dataToUpdate) {
  //       return { message: "Data tidak ditemukan." };
  //     }

  //     const lastTanggal = new Date(dataToUpdate.tanggal);
  //     const lastDate = lastTanggal.toISOString().split("T")[0];

  //     const newTanggal = new Date(data_jadwal.tanggal);
  //     const newDate = newTanggal.toISOString().split("T")[0];

  //     // Menggunakan moment untuk mengonversi waktu ke zona waktu lokal dan UTC
  //     const originalDateTime = moment.utc(`${lastDate}T${dataToUpdate.jam}`);
  //     const newDateTime = moment.utc(`${newDate}T${data_jadwal.jam}`);

  //     // Menghitung selisih waktu dalam milidetik
  //     const timeDifference = newDateTime.diff(originalDateTime);

  //     // Update data yang diubah
  //     await TiketJadwalProduksiPerJam.update(
  //       { tanggal: data_jadwal.tanggal, jam: data_jadwal.jam },
  //       { where: { id: _id }, transaction: t }
  //     );

  //     // Ambil semua data berikutnya berdasarkan tanggal dan jam
  //     const subsequentData = await TiketJadwalProduksiPerJam.findAll({
  //       where: {
  //         [Op.or]: [
  //           {
  //             tanggal: {
  //               [Op.gt]: dataToUpdate.tanggal, // Tanggal lebih besar
  //             },
  //           },
  //           {
  //             tanggal: dataToUpdate.tanggal, // Tanggal sama tetapi jam lebih besar
  //             jam: {
  //               [Op.gt]: dataToUpdate.jam,
  //             },
  //           },
  //         ],
  //         //mesin: data_jadwal.mesin,
  //         id_tiket_jadwal_produksi: dataToUpdate.id_tiket_jadwal_produksi,
  //       },
  //       order: [
  //         ["tanggal", "ASC"],
  //         ["jam", "ASC"],
  //       ],
  //     });

  //     // Update data berikutnya sesuai dengan selisih waktu dan pertahankan interval antar data
  //     let lastUpdatedDateTime = newDateTime;

  //     for (const data of subsequentData) {
  //       const lastTanggal = new Date(data.tanggal);
  //       const lastDate = lastTanggal.toISOString().split("T")[0];

  //       const currentDateTime = moment.utc(`${lastDate}T${data.jam}`);

  //       // Tambahkan selisih waktu ke data berikutnya
  //       const updatedDateTime = moment(currentDateTime).add(
  //         timeDifference,
  //         "milliseconds"
  //       );

  //       // Perbarui tanggal dan jam dengan format yang benar
  //       const updatedDate = updatedDateTime.toISOString().split("T")[0];
  //       const updatedTime = updatedDateTime
  //         .toISOString()
  //         .split("T")[1]
  //         .split(".")[0];

  //       await TiketJadwalProduksiPerJam.update(
  //         {
  //           tanggal: updatedDate,
  //           jam: updatedTime,
  //         },
  //         { where: { id: data.id }, transaction: t }
  //       );

  //       // Perbarui waktu untuk data selanjutnya
  //       lastUpdatedDateTime = updatedDateTime;
  //     }
  //     await t.commit();

  //     res.status(200).json({ msg: "update success" });
  //   } catch (error) {
  //     await t.rollback();
  //     res.status(400).json({ msg: error.message });
  //   }
  // },

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
      await TiketJadwalProduksiPerJam.update(
        { tanggal: data_jadwal.tanggal, jam: data_jadwal.jam },
        { where: { id: _id }, transaction: t }
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
        return jadwalLiburSet.includes(date);
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

      // Fungsi untuk menentukan waktu kerja berikutnya dengan interval yang sudah ditentukan
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

          // Cek apakah hari libur atau Minggu
          if (isHoliday(date) || day === "Minggu") {
            // Lompat ke hari kerja berikutnya
            let nextWorkingDate = moment(date).add(1, "days");
            let nextDay = getDayOfWeek(nextWorkingDate.format("YYYY-MM-DD"));

            while (
              isHoliday(nextWorkingDate.format("YYYY-MM-DD")) ||
              nextDay === "Minggu"
            ) {
              nextWorkingDate.add(1, "days");
              nextDay = getDayOfWeek(nextWorkingDate.format("YYYY-MM-DD"));
            }

            const nextShiftInfo = getShiftInfo(nextDay);

            if (nextShiftInfo && nextShiftInfo.shift_1_masuk) {
              nextDateTime = moment(
                `${nextWorkingDate.format("YYYY-MM-DD")}T${
                  nextShiftInfo.shift_1_masuk
                }`
              );
              continue;
            }
          }

          const shiftInfo = getShiftInfo(day);

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
              !isHoliday(nextDate.format("YYYY-MM-DD")) &&
              nextDay !== "Minggu"
            ) {
              const nextShiftInfo = getShiftInfo(nextDay);

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
              validWorkDay === "Minggu" ||
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

        await TiketJadwalProduksiPerJam.update(
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

      if (!data) return res.status(404).json({ msg: "data tidak ditemukana" });

      let dataJadwal = [];

      for (let i = 0; i < data.jadwal_per_jam.length; i++) {
        const dataJadwalJam = data.jadwal_per_jam[i];
        dataJadwal.push({
          item: data.item,
          no_jo: data.no_jo,
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

      await TiketJadwalProduksi.update(
        { status_tiket: "history" },
        { where: { id: id }, transaction: t }
      );

      await JadwalProduksi.bulkCreate(dataJadwal, { transaction: t });
      await t.commit();
      //console.log(data.jadwal_per_jam);
      res.status(200).json({ data: data });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },

  // simapanCalculateTiketJadwalProduksi: async (req, res) => {
  //   const { id } = req.params;
  //   const { tahap } = req.body;
  //   const t = await db.transaction();
  //   try {
  //     for (let i = 0; i < tahap.length; i++) {
  //       const data = tahap[i];
  //       await TiketJadwalProduksiTahapan.update(data, {
  //         where: { id: data.id },
  //         transaction: t,
  //       });

  //       await TiketJadwalProduksiPerJam.bulkCreate(
  //         {
  //           ...data,
  //           id_tiket_jadwal_produksi: id,
  //           id_tiket_jadwal_produksi_tahapan: data.id,
  //         },
  //         { transaction: t }
  //       );
  //     }
  //     await t.commit();

  //     res.status(200).json({ msg: "simpan succes" });
  //   } catch (err) {
  //     await t.rollback;
  //     res.status(500).json({ msg: err.message });
  //   }
  // },
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

module.exports = jadwalProduksiController;
