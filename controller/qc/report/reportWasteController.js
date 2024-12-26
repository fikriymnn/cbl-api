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

      //   //   console.log(dataMasterWaste.data.waste);

      //   const dataP1Waste = await axios.get(
      //     "https://erp.cbloffset.com/api/waste-lkh",

      //     { timeout: 10000 }
      //   );
      //console.log(dataP1Waste.data);
      // console.log(data_waste_p1);

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
      // const updatedDataP1 = data_waste_p1.map((item) => ({
      //   ...item,
      //   inspeksi_defect: item.waste.map((defect) => ({
      //     ...defect,
      //     total_defect: defect.total,
      //   })),
      //   waste: undefined, // Menghapus properti "waste"
      // }));

      //array untuk menggabungkan data p1 dan p2
      let dataWasteGabungan = [];

      //masukan data p1 ke array
      //dataWasteGabungan.push(...updatedDataP1);

      //masukan data p2 ke array
      dataWasteGabungan.push(...grupByJo);

      //hasil data gabungan di masukan sesuai master waste
      const grupJoinWithMaster = mapKodeToProduksi(
        dataWasteGabungan,
        data_waste_master
      );

      const jumlahAllData = aggregateByKodeProduksiWithWaste(
        dataWasteGabungan,
        data_waste_master
      );

      // Filter data grup jo gabungan berdasarkan total_defect > 0
      const filterGrupJoinWithMaster = grupJoinWithMaster.filter(
        (item) => item.total_defect > 0
      );

      // Filter data allWaste berdasarkan total_defect > 0
      const filterJumlahAllData = jumlahAllData.filter(
        (item) => item.total_defect > 0
      );

      // Urutkan data berdasarkan total_defect dari besar ke kecil
      // const resultGrupJoinWithMaster = filterGrupJoinWithMaster.sort(
      //   (a, b) => b.total_defect - a.total_defect
      // );

      // Urutkan data allWaste berdasarkan total_defect dari besar ke kecil
      const resultJumlahAllData = filterJumlahAllData.sort(
        (a, b) => b.total_defect - a.total_defect
      );
      const resultJumlahAllDataReplace =
        replaceKodeProduksiWithWaste(resultJumlahAllData);

      res.status(200).json({
        // data2: grupByJo,
        dataWasteAllReplace: resultJumlahAllDataReplace,
        dataWasteAll: resultJumlahAllData,

        //dataWasteByJo: resultGrupJoinWithMaster,
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
const mapKodeToProduksi = (inspeksiData, masterData) => {
  const masterMap = {};

  // Buat peta master berdasarkan kode_waste
  masterData.forEach((master) => {
    masterMap[master.kode_waste] = {
      waste_desc: master.waste_desc,
      kendala: master.waste,
    };
  });

  // Proses data jo
  const result = inspeksiData.map((joItem) => {
    const groupedDefects = {};

    joItem.inspeksi_defect.forEach((defect) => {
      const kode = defect.kode;

      // Jika kode ada di master
      if (masterMap[kode]) {
        if (!groupedDefects[kode]) {
          groupedDefects[kode] = {
            kode_waste: kode,
            waste_desc: masterMap[kode].waste_desc,
            total_defect: 0,
            kendala: masterMap[kode].kendala.map((kendala) => ({
              ...kendala,

              calculated_defect: 0, // Inisialisasi hasil perhitungan defect * bobot
            })),
          };
        }

        // Tambahkan total_defect untuk kode ini
        groupedDefects[kode].total_defect += defect.total_defect;
      }
    });

    // Distribusi defect ke kendala
    Object.values(groupedDefects).forEach((defectGroup) => {
      const totalDefect = defectGroup.total_defect;

      if (totalDefect > 0) {
        let remainingDefect = totalDefect;

        // Hitung defect dengan pembulatan awal
        defectGroup.kendala.forEach((kendala) => {
          kendala.calculated_defect = Math.round(
            (kendala.bobot * totalDefect) / 100
          );
          remainingDefect -= kendala.calculated_defect;
        });

        // Jika ada sisa, distribusikan secara merata
        if (remainingDefect !== 0) {
          defectGroup.kendala.sort((a, b) => b.bobot - a.bobot); // Urutkan berdasarkan bobot (desc)
          for (let i = 0; i < Math.abs(remainingDefect); i++) {
            const index = i % defectGroup.kendala.length;
            defectGroup.kendala[index].calculated_defect +=
              remainingDefect > 0 ? 1 : -1;
          }
        }
      }
    });

    // Hitung total keseluruhan defects
    const total_defect = Object.values(groupedDefects).reduce(
      (sum, defect) => sum + defect.total_defect,
      0
    );

    // Kembalikan data jo dengan defects (mungkin kosong jika tidak ada kecocokan)
    return {
      no_jo: joItem.no_jo,
      total_defect,
      defects: Object.values(groupedDefects),
    };
  });

  return result;
};

function aggregateByKodeProduksiWithWaste(inspeksiData, masterData) {
  const masterMap = {};

  // Buat peta master berdasarkan kode_waste
  masterData.forEach((master) => {
    masterMap[master.kode_waste] = {
      kode_waste: master.kode_waste,
      waste_desc: master.waste_desc,
      kendala: master.waste.map((kendala) => ({
        ...kendala,
        total_defect: 0, // Inisialisasi total_defect di kendala
        calculated_defect: 0, // Inisialisasi hasil perhitungan defect * bobot
      })),
      total_defect: 0,
    };
  });

  // Proses data dari semua JO
  inspeksiData.forEach((joItem) => {
    joItem.inspeksi_defect.forEach((defect) => {
      const kode = defect.kode;

      // Jika kode ada di master
      if (masterMap[kode]) {
        // Tambahkan total_defect untuk kode ini
        masterMap[kode].total_defect += defect.total_defect;
      }
    });
  });

  // Distribusi defect ke kendala dalam setiap master kode_waste
  Object.values(masterMap).forEach((defectGroup) => {
    const totalDefect = defectGroup.total_defect;

    if (totalDefect > 0) {
      let remainingDefect = totalDefect;

      // Hitung defect dengan pembulatan awal
      defectGroup.kendala.forEach((kendala) => {
        kendala.calculated_defect = Math.round(
          (kendala.bobot * totalDefect) / 100
        );
        remainingDefect -= kendala.calculated_defect;
      });

      // Jika ada sisa, distribusikan secara merata
      if (remainingDefect !== 0) {
        defectGroup.kendala.sort((a, b) => b.bobot - a.bobot); // Urutkan berdasarkan bobot (desc)
        for (let i = 0; i < Math.abs(remainingDefect); i++) {
          const index = i % defectGroup.kendala.length;
          defectGroup.kendala[index].calculated_defect +=
            remainingDefect > 0 ? 1 : -1;
        }
      }
    }
  });

  // Kembalikan hasil agregasi
  return Object.values(masterMap).map((master) => ({
    kode_waste: master.kode_waste,
    waste_desc: master.waste_desc,
    total_defect: master.total_defect,
    kendala: master.kendala,
  }));
}

function replaceKodeProduksiWithWaste(inspeksiData) {
  const kendalaMap = {};

  inspeksiData.forEach((waste) => {
    waste.kendala.forEach((kendala) => {
      if (!kendalaMap[kendala.kode_kendala]) {
        kendalaMap[kendala.kode_kendala] = {
          kode_kendala: kendala.kode_kendala,
          kendala_desc: kendala.kendala_desc,
          bobot: kendala.bobot,
          total_defect: kendala.calculated_defect,
          kode_waste: [
            {
              kode_waste: waste.kode_waste,
              waste_desc: waste.waste_desc,
              total_defect: kendala.calculated_defect,
            },
          ],
        };
      } else {
        kendalaMap[kendala.kode_kendala].total_defect +=
          kendala.calculated_defect;
        kendalaMap[kendala.kode_kendala].kode_waste.push({
          kode_waste: waste.kode_waste,
          waste_desc: waste.waste_desc,
          total_defect: kendala.calculated_defect,
        });
      }
    });
  });

  const result = Object.values(kendalaMap);

  const resultSortir = result.sort((a, b) => b.total_defect - a.total_defect);

  // Kembalikan hasil agregasi
  return resultSortir;
}
module.exports = ReportWasterQc;
