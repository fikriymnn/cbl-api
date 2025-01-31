const { Op, fn, col, literal, Sequelize } = require("sequelize");
const BarangRusakV2 = require("../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Model");
const BarangRusakPointV2 = require("../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const BarangRusakDefectV2 = require("../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Model");
const Rabut = require("../../../model/qc/inspeksi/rabut/inspeksiRabutModel");
const RabutPoint = require("../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const RabutDefect = require("../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");
const AmparLem = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemModel");
const AmparLemPoint = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPointModel");
const AmparLemDefect = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemDefectModel");
const User = require("../../../model/userModel");
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

      // const dataP1Waste = await axios.get(
      //   "https://erp.cbloffset.com/api/waste-lkh",

      //   { timeout: 10000 }
      // );
      //console.log(dataP1Waste.data);
      // console.log(data_waste_p1);

      const dataBarangRS = await BarangRusakV2.findAll({
        where: {
          createdAt: {
            [Op.between]: [new Date(start_date), new Date(end_date)],
          },
          status: "history",
        },
        include: [
          {
            model: BarangRusakDefectV2,
            as: "inspeksi_barang_rusak_defect_v2",
            include: [
              {
                model: BarangRusakPointV2,
                as: "inspeksi_barang_rusak_point_v2",
                include: [
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
            ],
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
            include: [
              {
                model: RabutPoint,
                as: "inspeksi_rabut_point",
                include: [
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
            ],
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
            include: [
              {
                model: AmparLemPoint,
                as: "inspeksi_ampar_lem_point",
                include: [
                  {
                    model: User,
                    as: "inspektor",
                  },
                ],
              },
            ],
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
            // console.log(data.inspeksi_barang_rusak_defect_v2);
            return data.inspeksi_barang_rusak_defect_v2.map((defect) => ({
              temuan: "sortir_RS",
              no_jo: data.no_jo,
              no_io: data.no_io,
              customer: data.customer,
              nama_produk: data.nama_produk,
              mesin: null,
              operator: data.operator,
              tanggal: defect.inspeksi_barang_rusak_point_v2.waktu_mulai,
              inspektor: defect.inspeksi_barang_rusak_point_v2.inspektor.nama,
              total_defect:
                defect.jumlah_defect == null ? 0 : defect.jumlah_defect,
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
              temuan: "sampling_rabut",
              no_jo: data.no_jo,
              no_jo: data.no_jo,
              no_io: data.no_io,
              customer: data.customer,
              nama_produk: data.nama_produk,
              mesin: data.mesin,
              operator: data.operator,
              tanggal: defect.inspeksi_rabut_point.waktu_mulai,
              inspektor: defect.inspeksi_rabut_point.inspektor.nama,
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
              temuan: "ampar_lem",
              no_jo: data.no_jo,
              mesin: data.mesin,
              no_jo: data.no_jo,
              no_io: data.no_io,
              customer: data.customer,
              nama_produk: data.nama_produk,
              operator: data.operator,
              inspektor: defect.inspeksi_ampar_lem_point.inspektor.nama,
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
          temuan: "helper",
          total_defect: defect.total,
          kode: defect.kode_waste,
          masalah: defect.desc_waste,
          kode_lkh: defect.kode_kendala,
          masalah_lkh: defect.desc_kendala,
          inspektor: item.inspektor,
          operator: item.operator,
          tgl: item.tgl,
        })),
        waste: undefined, // Menghapus properti "waste"
      }));

      //array untuk menggabungkan data p1 dan p2
      let dataWasteGabungan = [];

      //masukan data p1 ke array
      dataWasteGabungan.push(...updatedDataP1);

      //masukan data p2 ke array
      dataWasteGabungan.push(...grupByJo);

      const datamasterReplace = transformDataMaster(data_waste_master);

      //hasil data gabungan di masukan sesuai master waste
      const grupJoinWithMaster = mapKodeToProduksi(
        dataWasteGabungan,
        data_waste_master
      );

      const grupJoinWithMasterReplace = mapKodeToProduksiReplace(
        dataWasteGabungan,
        datamasterReplace,
        grupJoinWithMaster
      );

      const jumlahAllData = aggregateByKodeProduksiWithWaste(
        dataWasteGabungan,
        data_waste_master
      );

      // Filter data grup jo gabungan berdasarkan total_defect > 0
      const filterGrupJoinWithMaster = grupJoinWithMaster.filter(
        (item) => item.total_defect > 0
      );

      // Filter data grup jo gabungan replace berdasarkan total_defect > 0
      const filterGrupJoinWithMasterReplace = grupJoinWithMasterReplace.filter(
        (item) => item.total_defect > 0
      );

      // Filter data allWaste berdasarkan total_defect > 0
      const filterJumlahAllData = jumlahAllData.filter(
        (item) => item.total_defect > 0
      );

      //Urutkan data berdasarkan total_defect dari besar ke kecil
      const resultGrupJoinWithMaster = filterGrupJoinWithMaster.sort(
        (a, b) => b.total_defect - a.total_defect
      );

      //Urutkan data berdasarkan total_defect dari besar ke kecil
      const resultGrupJoinWithMasterReplace =
        filterGrupJoinWithMasterReplace.sort(
          (a, b) => b.total_defect - a.total_defect
        );

      // Urutkan data allWaste berdasarkan total_defect dari besar ke kecil
      const resultJumlahAllData = filterJumlahAllData.sort(
        (a, b) => b.total_defect - a.total_defect
      );
      const JumlahAllDataReplace =
        replaceKodeProduksiWithWaste(resultJumlahAllData);
      const resultJumlahAllDataReplace = JumlahAllDataReplace.filter(
        (item) => item.total_defect > 0
      );

      const dataByKategori = getDataByKategoriAll(resultJumlahAllData);

      res.status(200).json({
        //data2: resultGrupJoinWithMaster,
        //data3: datamasterReplace,
        dataWasteAllReplace: resultJumlahAllDataReplace,
        dataWasteAll: resultJumlahAllData,
        dataWasteByJo: resultGrupJoinWithMaster,
        dataWasteByJoReplace: resultGrupJoinWithMasterReplace,
        dataByKategori: dataByKategori,
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
    const existingDefect = result[item.no_jo].find((defect) => {
      defect.kode === item.kode && defect.kode_lkh === item.kode_lkh;
    });
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
    no_io: defects[0].no_io,
    customer: defects[0].customer,
    nama_produk: defects[0].nama_produk,
    inspeksi_defect: defects,
  }));
};

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
      const kodeLKH = defect.kode_lkh;
      const mesin = defect.mesin;
      const operator = defect.operator;
      const inspektor = defect.inspektor;
      const temuan = defect.temuan;

      // Jika kode ada di master
      if (masterMap[kode]) {
        if (!groupedDefects[kode]) {
          groupedDefects[kode] = {
            temuan: temuan,
            kode_waste: kode,
            mesin: mesin,
            operator: operator,
            inspektor: inspektor,
            waste_desc: masterMap[kode].waste_desc,
            kategori: getCategoryWaste(kode),
            total_defect: 0,
            kendala: masterMap[kode].kendala.map((kendala) => ({
              ...kendala,
              calculated_defect: 0, // Inisialisasi hasil perhitungan defect berdasarkan kode_lkh
            })),
          };
        }

        // Tambahkan total_defect untuk kode ini
        groupedDefects[kode].total_defect += defect.total_defect;

        // Hitung calculated_defect untuk setiap kendala
        groupedDefects[kode].kendala.forEach((kendala) => {
          if (kendala.kode_kendala === kodeLKH) {
            kendala.calculated_defect += defect.total_defect;
          }
        });
      }
    });

    const grupByKategori = groupByCategoryWithDefault(groupedDefects);

    // Kembalikan data jo dengan defects yang sudah dikelompokkan
    return {
      no_jo: joItem.no_jo,
      no_io: joItem.no_io,
      customer: joItem.customer,
      nama_produk: joItem.nama_produk,
      defectsByKategori: grupByKategori,
      total_defect: Object.values(groupedDefects).reduce(
        (sum, defect) => sum + defect.total_defect,
        0
      ),
      defects: Object.values(groupedDefects),
    };
  });

  return result;
};

const mapKodeToProduksiReplace = (
  inspeksiData,
  masterData,
  dataMapToKodeProduksi
) => {
  const masterMap = {};

  // Buat peta master berdasarkan kode_waste
  masterData.forEach((master) => {
    masterMap[master.kode_kendala] = {
      kendala_desc: master.kendala_desc,
      kendala: master.related_wastes,
    };
  });

  // Proses data jo
  const result = inspeksiData.map((joItem) => {
    const groupedDefects = {};

    joItem.inspeksi_defect.forEach((defect) => {
      const kode = defect.kode;
      const kodeLKH = defect.kode_lkh;
      const mesin = defect.mesin;

      // Jika kode ada di master
      if (masterMap[kodeLKH]) {
        if (!groupedDefects[kodeLKH]) {
          groupedDefects[kodeLKH] = {
            kode_kendala: kodeLKH,
            kendala_desc: masterMap[kodeLKH].kendala_desc,
            total_defect: 0,
            mesin: mesin,
            kendala: masterMap[kodeLKH].kendala.map((kendala) => ({
              ...kendala,
              calculated_defect: 0, // Inisialisasi hasil perhitungan defect berdasarkan kode_lkh
            })),
          };
        }

        // Tambahkan total_defect untuk kode ini
        groupedDefects[kodeLKH].total_defect += defect.total_defect;

        // Hitung calculated_defect untuk setiap kendala
        groupedDefects[kodeLKH].kendala.forEach((kendala) => {
          if (kendala.kode_waste === kode) {
            kendala.calculated_defect += defect.total_defect;
          }
        });
      }
    });

    //mengambil data dari hasil perhitungan mapKodeToProduksi untuk mengambil data DefectByKategori
    const dataDefectByKategori = dataMapToKodeProduksi.find(
      (data) => joItem.no_jo === data.no_jo
    );

    // Kembalikan data jo dengan defects yang sudah dikelompokkan
    return {
      no_jo: joItem.no_jo,
      no_io: joItem.no_io,
      customer: joItem.customer,
      nama_produk: joItem.nama_produk,
      defectsByKategori: dataDefectByKategori.defectsByKategori,
      total_defect: Object.values(groupedDefects).reduce(
        (sum, defect) => sum + defect.total_defect,
        0
      ),
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
      total_defect: 0,
      kode_waste: master.kode_waste,
      waste_desc: master.waste_desc,
      kendala: master.waste.map((kendala) => ({
        ...kendala,
        total_defect: 0, // Inisialisasi total_defect di kendala
        calculated_defect: 0, // Inisialisasi hasil perhitungan defect * bobot
        mesin: null,
        operator: null,
        inspektor: null,

        kategori: null,
      })),
    };
  });

  // Proses data dari semua JO
  inspeksiData.forEach((joItem) => {
    joItem.inspeksi_defect.forEach((defect) => {
      const kode = defect.kode;
      const kodeLKH = defect.kode_lkh;
      const mesin = defect.mesin;
      const operator = defect.operator;
      const inspektor = defect.inspektor;
      const temuan = defect.temuan;

      // Jika kode ada di master
      if (masterMap[kode]) {
        // Tambahkan total_defect untuk kode ini
        masterMap[kode].total_defect += defect.total_defect;
        masterMap[kode]?.kendala.forEach((kendala) => {
          if (kendala.kode_kendala === kodeLKH) {
            kendala.calculated_defect += defect.total_defect;
            (kendala.mesin = mesin),
              (kendala.operator = operator),
              (kendala.inspektor = inspektor),
              (kendala.kategori = getCategoryWaste(kode));
          }
        });
      }
      // Hitung calculated_defect untuk setiap kendala
    });
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
          kategori_kendala: kendala.kategori_kendala,
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

function getDataByKategoriAll(dataAll) {
  let dataKendalaAll = [];
  dataAll.map((item) => {
    dataKendalaAll.push(...item.kendala);
  });

  // Filter data grup jo gabungan replace berdasarkan total_defect > 0
  const filterDataAllKendala = dataKendalaAll.filter(
    (item) => item.calculated_defect > 0
  );

  const dataKendalaByKategori = filterDataAllKendala.reduce(
    (result, current) => {
      const { kategori_kendala, calculated_defect } = current;

      // Jika kategori_kendala sudah ada dalam result
      if (result[kategori_kendala]) {
        result[kategori_kendala].total_calculated_defect += calculated_defect;
        //result[kategori_kendala].kendala.push(current);
      } else {
        // Jika kategori_kendala belum ada, buat kategori baru
        result[kategori_kendala] = {
          total_calculated_defect: calculated_defect,
          kategori_kendala,
          //kendala: [current],
        };
      }

      return result;
    },
    {}
  );

  const resultMesin = {};

  filterDataAllKendala.forEach((item) => {
    // Hanya proses jika kategori_kendala adalah "Mesin"
    if (item.kategori_kendala === "Mesin") {
      const key = `${item.kategori_kendala}-${item.mesin || "No Machine"}`;

      if (!resultMesin[key]) {
        resultMesin[key] = {
          kategori_kendala: item.kategori_kendala,
          mesin: item.mesin || "No Machine",
          total_calculated_defect: 0,
        };
      }

      resultMesin[key].total_calculated_defect += item.calculated_defect;
    }
  });
  const resultDataKendalaByKategori = Object.values(dataKendalaByKategori).sort(
    (a, b) => b.total_calculated_defect - a.total_calculated_defect
  );

  return {
    dataKendala: resultDataKendalaByKategori,
    dataKendalaMesin: Object.values(resultMesin),
  };
}

const transformDataMaster = (data) => {
  const kendalaMap = {};

  data.forEach((item) => {
    const { kode_waste, waste_desc, waste } = item;

    waste.forEach((kendala) => {
      const { kode_kendala, kendala_desc, kategori_kendala, bobot } = kendala;

      if (!kendalaMap[kode_kendala]) {
        kendalaMap[kode_kendala] = {
          kode_kendala,
          kendala_desc,
          kategori_kendala,
          bobot,
          related_wastes: [],
        };
      }

      kendalaMap[kode_kendala].related_wastes.push({
        kode_waste,
        waste_desc,
      });
    });
  });

  return Object.values(kendalaMap);
};

// Daftar kategori default
const defaultCategories = ["CETAK", "COATING", "POND", "LEM", "UNKNOWN"];
const groupByCategoryWithDefault = (data) => {
  let result = {};

  // Inisialisasi kategori default dengan null dan total_defect = 0
  defaultCategories.forEach((category) => {
    result[category] = { total_defect: 0, data: null };
  });

  // Proses pengelompokan data
  Object.values(data).forEach((item) => {
    const { kategori, temuan, inspektor, total_defect } = item;

    if (!result[kategori].data) {
      result[kategori].data = {};
    }

    if (!result[kategori].data[temuan]) {
      result[kategori].data[temuan] = [];
    }

    let existinginspektor = result[kategori].data[temuan].find(
      (op) => op.inspektor === inspektor
    );
    if (!existinginspektor) {
      existinginspektor = {
        inspektor: inspektor,
        wastes: [],
      };
      result[kategori].data[temuan].push(existinginspektor);
    }

    existinginspektor.wastes.push({
      kode_waste: item.kode_waste,
      waste_desc: item.waste_desc,
      total_defect: item.total_defect,
    });

    // Tambahkan total_defect untuk kategori
    result[kategori].total_defect += total_defect;
  });

  return result;
};

const getCategoryWaste = (item) => {
  if (/^CO/.test(item)) {
    return "COATING";
  } else if (/^C(?!O)/.test(item)) {
    return "CETAK";
  } else if (/^P/.test(item)) {
    return "POND";
  } else if (/^L/.test(item)) {
    return "LEM";
  } else {
    return "UNKNOWN"; // Jika tidak cocok dengan kategori yang ada
  }
};
module.exports = ReportWasterQc;
