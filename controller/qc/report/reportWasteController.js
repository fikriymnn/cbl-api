const { Op, fn, col, literal, Sequelize } = require("sequelize");
const BarangRusak = require("../../../model/qc/inspeksi/barangRusak/inspeksiBarangRusakModel");
const BarangRusakDefect = require("../../../model/qc/inspeksi/barangRusak/inspeksiBarangRusakDefectModel");
const Rabut = require("../../../model/qc/inspeksi/rabut/inspeksiRabutModel");
const RabutDefect = require("../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");
const AmparLem = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemModel");
const AmparLemDefect = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemDefectModel");
const axios = require("axios");

const ReportWasterQc = {
  getReportWasteQc: async (req, res) => {
    const { start_date, end_date, data_waste_master, data_waste_p1 } = req.body;

    try {
      //   const dataMasterWaste = await axios.get(
      //     "http://erp.cbloffset.com/api/master-waste",
      //     { timeout: 10000 }
      //   );

      //   console.log(dataMasterWaste.data.waste);

      //   const dataP1Waste = await axios.get(
      //     "https://erp.cbloffset.com/api/waste-lkh",
      //     { timeout: 10000 }
      //   );

      console.log(data_waste_p1);

      const dataBarangRS = await BarangRusak.findAll({
        where: {
          createdAt: {
            [Op.between]: [new Date(start_date), new Date(end_date)],
          },
          status: "history",
        },
        include: [
          {
            model: BarangRusakDefect,
            as: "inspeksi_barang_rusak_defect",
          },
        ],
      });

      const dataRabut = await Rabut.findAll({
        where: {
          createdAt: {
            [Op.between]: [new Date(start_date), new Date(end_date)],
          },
          status: "history",
        },
        include: [
          {
            model: RabutDefect,
            as: "inspeksi_defect",
          },
        ],
      });

      const dataAmparLem = await AmparLem.findAll({
        where: {
          createdAt: {
            [Op.between]: [new Date(start_date), new Date(end_date)],
          },
          status: "history",
        },
        include: [
          {
            model: AmparLemDefect,
            as: "inspeksi_defect",
          },
        ],
      });

      let resultBarangRS = [];
      let resultRabut = [];
      let resultAmparLem = [];
      if (dataBarangRS.length != 0) {
        // Proses untuk mengeluarkan data defect BarangRs dengan tambahan no_jo
        resultBarangRS = dataBarangRS
          .map((result) => {
            const data = result.get({ plain: true }); // Mengambil data bersih
            return data.inspeksi_barang_rusak_defect.map((defect) => ({
              no_jo: data.no_jo,
              total_defect: defect.sub_total == null ? 0 : defect.sub_total,
              ...defect,
            }));
          })
          .flat();
      }

      if (dataRabut.length != 0) {
        // Proses untuk mengeluarkan data defect Rabut dengan tambahan no_jo
        resultRabut = dataRabut
          .map((result) => {
            const data = result.get({ plain: true }); // Mengambil data bersih
            return data.inspeksi_defect.map((defect) => ({
              no_jo: data.no_jo,
              total_defect: defect.hasil == null ? 0 : defect.hasil,
              ...defect,
            }));
          })
          .flat();
      }

      if (dataAmparLem.length != 0) {
        // Proses untuk mengeluarkan data defect Ampar Lem dengan tambahan no_jo
        resultAmparLem = dataAmparLem
          .map((result) => {
            const data = result.get({ plain: true }); // Mengambil data bersih
            return data.inspeksi_defect.map((defect) => ({
              no_jo: data.no_jo,
              mesin: data.mesin,
              total_defect: defect.hasil == null ? 0 : defect.hasil,
              ...defect,
            }));
          })
          .flat();
      }

      const resultGabung = [];

      resultGabung.push(...resultBarangRS);
      resultGabung.push(...resultRabut);
      resultGabung.push(...resultAmparLem);

      //grup berdasarkan jo yang sama
      const grupByJo = groupedDataBerdasarkanJO(resultGabung);

      //update data waste p1 menyesuaikan dengan data p2
      const updatedDataP1 = data_waste_p1.map((item) => ({
        ...item,
        inspeksi_defect: item.waste.map((defect) => ({
          ...defect,
          total_defect: defect.total,
        })),
        waste: undefined, // Menghapus properti "waste"
      }));

      //array untuk menggabungkan data p1 dan p2
      let dataWasteGabungan = [];

      //masukan data p1 ke array
      dataWasteGabungan.push(...updatedDataP1);

      //masukan data p2 ke array
      dataWasteGabungan.push(...grupByJo);

      //hasil data gabungan di masukan sesuai master waste
      const grupJoinWithMaster = mapKodeToProduksi(
        dataWasteGabungan,
        data_waste_master
      );

      const jumlahAllData =
        aggregateByKodeProduksiWithWaste(grupJoinWithMaster);

      res.status(200).json({
        data2: grupByJo,

        // dataWasteAll: jumlahAllData,
        // dataWasteByJo: grupJoinWithMaster,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

const groupedDataBerdasarkanJO = (data) => {
  const groupedByNoJo = data.reduce((result, item) => {
    // Cek apakah no_jo sudah ada dalam result
    if (!result[item.no_jo]) {
      result[item.no_jo] = [];
    }

    // Gabungkan data berdasarkan no_jo
    const existingDefect = result[item.no_jo].find(
      (defect) => defect.kode === item.kode
    );
    if (existingDefect) {
      // Jika kode sudah ada, jumlahkan sub_total
      existingDefect.total_defect += item.total_defect;
    } else {
      // Jika tidak ada, tambahkan sebagai item baru
      result[item.no_jo].push({ ...item });
    }

    return result;
  }, {});

  // Konversi hasil ke array jika diperlukan
  return Object.entries(groupedByNoJo).map(([no_jo, defects, mesin]) => ({
    no_jo,
    inspeksi_defect: defects,
  }));
};

// untuk mengelompokan dan menjumlahkan data berdasarkan no_jo
const mapKodeToProduksi = (inspeksiData, produksiData) => {
  // Kelompokkan data inspeksi berdasarkan no_jo
  const groupedInspeksi = inspeksiData.reduce((acc, inspeksi) => {
    if (!acc[inspeksi.no_jo]) {
      acc[inspeksi.no_jo] = [];
    }
    acc[inspeksi.no_jo].push(...inspeksi.inspeksi_defect);
    return acc;
  }, {});

  // Proses produksi data dan gabungkan dengan data inspeksi berdasarkan no_jo
  return Object.keys(groupedInspeksi).map((no_jo) => {
    // Ambil semua produksi yang terkait dengan no_jo
    const relatedProduksi = produksiData.map((produksi) => {
      // Menggabungkan data waste dan menghitung sub_total untuk setiap kode
      const wasteData = produksi.waste.map((wasteItem) => {
        let sub_total = 0;

        // Cari kecocokan kode di semua kelompok inspeksi berdasarkan no_jo
        groupedInspeksi[no_jo].forEach((defect) => {
          if (defect.kode === wasteItem.kode_waste) {
            sub_total += defect.total_defect; // Jumlahkan sub_total jika ada kecocokan
          }
        });
        const bobotKode =
          wasteItem.bobot == null || undefined ? 100 : wasteItem.bobot;
        const totalPercent = (sub_total * bobotKode) / 100;

        return {
          kode: wasteItem.kode_waste,
          nama_waste: wasteItem.waste_desc,
          sub_total: sub_total, // Menampilkan hasil jumlah sub_total
          sub_total_percent: totalPercent,
          bobot: wasteItem.bobot,
        };
      });

      // Menghitung total sub_total untuk setiap kelompok no_jo dalam produksi ini
      const totalSubTotal = wasteData.reduce(
        (total, waste) => total + waste.sub_total,
        0
      );

      return {
        e_kode_produksi: produksi.kode_kendala,
        e_deskripsi: produksi.kendala_desc,
        waste: wasteData,
        total_sub_total: totalSubTotal,
      };
    });

    // Menghitung total sub_total untuk seluruh no_jo
    const totalJoSubTotal = groupedInspeksi[no_jo].reduce(
      (sum, defect) => sum + defect.sub_total,
      0
    );

    // Mengembalikan data yang sudah digabung
    return {
      no_jo: no_jo,
      total_jo_sub_total: totalJoSubTotal,
      produksi: relatedProduksi,
    };
  });
};

function aggregateByKodeProduksiWithWaste(inspeksiData) {
  const kodeProduksiSummary = {};

  // Iterasi melalui semua data inspeksi menggunakan for loop
  for (let i = 0; i < inspeksiData.length; i++) {
    const inspeksi = inspeksiData[i];

    for (let j = 0; j < inspeksi.produksi.length; j++) {
      const produksi = inspeksi.produksi[j];
      const kodeProduksi = produksi.e_kode_produksi;

      // Pastikan objek untuk kode produksi sudah ada dalam summary
      if (!kodeProduksiSummary[kodeProduksi]) {
        kodeProduksiSummary[kodeProduksi] = {
          e_kode_produksi: kodeProduksi,
          e_deskripsi: produksi.e_deskripsi,
          waste: [], // Mengubah struktur waste menjadi array
          total_sub_total: 0, // Total sub_total per kode produksi
        };
      }

      // Iterasi waste menggunakan for loop
      for (let k = 0; k < produksi.waste.length; k++) {
        const waste = produksi.waste[k];

        const bobotKode = waste.bobot == null || undefined ? 100 : waste.bobot;

        // Cari waste berdasarkan kode, jika belum ada, tambahkan baru
        let existingWaste = kodeProduksiSummary[kodeProduksi].waste.find(
          (w) => w.kode === waste.kode
        );

        if (!existingWaste) {
          existingWaste = {
            kode: waste.kode,
            nama_waste: waste.nama_waste,
            sub_total: 0,
            sub_total_percent: 0,
            bobot: bobotKode,
          };
          kodeProduksiSummary[kodeProduksi].waste.push(existingWaste);
        }

        // Jumlahkan sub_total waste untuk kode produksi yang sama
        existingWaste.sub_total += waste.sub_total;

        // Bagi berdasarkan bobot
        existingWaste.sub_total_percent =
          (existingWaste.sub_total * bobotKode) / 100;

        // Jumlahkan total sub_total untuk kode produksi
        kodeProduksiSummary[kodeProduksi].total_sub_total += waste.sub_total;
      }
    }
  }

  // Mengubah summary menjadi array dan mengembalikannya
  return Object.values(kodeProduksiSummary);
}

module.exports = ReportWasterQc;
