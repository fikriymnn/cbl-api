const { Op, Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const InspeksiBahan = require("../../../model/qc/inspeksi/bahan/inspeksiBahanModel");
const InspeksiBahanResult = require("../../../model/qc/inspeksi/bahan/inspeksiBahanResultModel");

const InspeksiPotong = require("../../../model/qc/inspeksi/potong/inspeksiPotongModel");
const InspeksiPotongResult = require("../../../model/qc/inspeksi/potong/inspeksiPotongResultModel");

const InspeksiCetak = require("../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const InspeksiCetakPeriode = require("../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");

const InspeksiCoating = require("../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingSubAwal = require("../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");

const InspeksiPond = require("../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondAwal = require("../../../model/qc/inspeksi/pond/inspeksiPondAwalModel");
const InspeksiPondAwalPoint = require("../../../model/qc/inspeksi/pond/inspeksiPondAwalPointModel");
const InspeksiPondPeriode = require("../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");

const InspeksiBarangRusakV2 = require("../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Model");
const InspeksiBarangRusakPointV2 = require("../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const InspeksiBarangRusakDefectV2 = require("../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Model");

const InspeksiRabutPoint = require("../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const InspeksiRabut = require("../../../model/qc/inspeksi/rabut/inspeksiRabutModel");
const InspeksiRabutDefect = require("../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");

const InspeksiLem = require("../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemAwal = require("../../../model/qc/inspeksi/lem/inspeksiLemAwalModel");
const InspeksiLemAwalPoint = require("../../../model/qc/inspeksi/lem/inspeksiLemAwalPointModel");
const InspeksiLemPeriode = require("../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");

const InspeksiAmparLemPoint = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPointModel");
const InspeksiAmparLem = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemModel");
const InspeksiAmparLemDefect = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemDefectModel");

const InspeksiLipat = require("../../../model/qc/inspeksi/lipat/inspeksiLipatModel");
const InspeksiLipatResult = require("../../../model/qc/inspeksi/lipat/inspeksiLipatResultModel");
const InspeksiLipatPoint = require("../../../model/qc/inspeksi/lipat/inspeksiLipatPointModel");

const InspeksiFinal = require("../../../model/qc/inspeksi/final/inspeksiFinalModel");
const InspeksiFinalPoint = require("../../../model/qc/inspeksi/final/inspeksiFinalPoint");
const InspeksiFinalSub = require("../../../model/qc/inspeksi/final/inspeksiFinalSubModel");

const User = require("../../../model/userModel");

const ReportQC = {
  getReportCheckseet: async (req, res) => {
    const { start_date, end_date } = req.query;
    try {
      if (!start_date)
        return res.status(404).json({ msg: "start_date required!!" });
      if (!end_date)
        return res.status(404).json({ msg: "end_date required!!" });

      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);

      const dataBahan = await getIncomingBahan(startDate, endDate);
      const dataPotongBahan = await getPotongBahan(startDate, endDate);
      const dataCetak = await getCetak(startDate, endDate);
      const dataCoating = await getCoating(startDate, endDate);
      const dataPond = await getPond(startDate, endDate);
      const dataSortirRS = await getSortirRs(startDate, endDate);
      const dataSamplingRabut = await getSamplingRabut(startDate, endDate);
      const dataLem = await getLem(startDate, endDate);
      const dataAmparLem = await getAmparLem(startDate, endDate);
      const dataPotongJadi = await getPotongJadi(startDate, endDate);
      const dataLipat = await getLipat(startDate, endDate);
      const dataFinalInspection = await getFinalInspection(startDate, endDate);

      const dataGrupMap = new Map();

      const setDataGrup = (no_jo, no_io, item) => {
        dataGrupMap.set(no_jo, {
          no_jo,
          no_io,
          item,
          incoming_bahan: [],
          potong_bahan: [],
          cetak: [],
          coating: [],
          pond: [],
          sortir_rs: [],
          sampling_rabut: [],
          lem: [],
          ampar_lem: [],
          potong_jadi: [],
          lipat: [],
          final_inspection: [],
        });
      };

      //incoming bahan (ini nanti di simpen paling terakhir)
      // dataBahan.forEach((entry) => {
      //   const { no_jo, no_io, item } = entry;

      //   if (!dataGrupMap.has(no_jo)) {
      //  setDataGrup(no_jo)
      //   }

      //   dataGrupMap.get(no_jo).potong_bahan.push(entry);
      // });

      //potong bahan
      dataPotongBahan.forEach((entry) => {
        const { no_jo, no_io, item } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, item);
        }
        dataGrupMap.get(no_jo).potong_bahan.push(entry);
      });

      //cetak
      dataCetak.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).cetak.push(entry);
      });

      //coanting
      dataCoating.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).coating.push(entry);
      });

      //pond
      dataPond.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).pond.push(entry);
      });

      //sortir rs
      dataSortirRS.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).sortir_rs.push(entry);
      });

      //sampling rabut
      dataSamplingRabut.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).sampling_rabut.push(entry);
      });

      //lem
      dataLem.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).lem.push(entry);
      });

      //ampar lem
      dataAmparLem.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).ampar_lem.push(entry);
      });

      //potong jadi
      dataPotongJadi.forEach((entry) => {
        const { no_jo, no_io, item } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, item);
        }
        dataGrupMap.get(no_jo).potong_jadi.push(entry);
      });

      //lipat
      dataLipat.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).lipat.push(entry);
      });

      //sortir rs
      dataFinalInspection.forEach((entry) => {
        const { no_jo, no_io, nama_produk } = entry;
        if (!dataGrupMap.has(no_jo)) {
          setDataGrup(no_jo, no_io, nama_produk);
        }
        dataGrupMap.get(no_jo).final_inspection.push(entry);
      });

      // Ubah hasil map jadi array
      const dataGrupMapResult = Array.from(dataGrupMap.values());
      res.status(200).json({ data: dataGrupMapResult });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

const getIncomingBahan = async (startDate, endDate) => {
  const dataBahan = await InspeksiBahan.findAll({
    // include: { model: InspeksiBahanResult, as: "inspeksi_bahan_result" },
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataBahan;
};

const getPotongBahan = async (startDate, endDate) => {
  const dataPotongBahan = await InspeksiPotong.findAll({
    // include: {
    //   model: InspeksiPotongResult,
    //   as: "inspeksi_potong_result",
    // },
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
      jenis_potong: "potong bahan",
    },
  });
  return dataPotongBahan;
};

const getCetak = async (startDate, endDate) => {
  const dataCetak = await InspeksiCetak.findAll({
    // include: [
    //   {
    //     model: InspeksiCetakAwal,
    //     as: "inspeksi_cetak_awal",
    //     include: [
    //       {
    //         model: InspeksiCetakAwalPoint,
    //         as: "inspeksi_cetak_awal_point",
    //         include: {
    //           model: User,
    //           as: "inspektor",
    //         },
    //       },
    //     ],
    //   },
    //   {
    //     model: InspeksiCetakPeriode,
    //     as: "inspeksi_cetak_periode",
    //     include: [
    //       {
    //         model: InspeksiCetakPeriodePoint,
    //         as: "inspeksi_cetak_periode_point",
    //         include: [
    //           {
    //             model: User,
    //             as: "inspektor",
    //           },
    //           {
    //             model: InspeksiCetakPeriodeDefect,
    //             as: "inspeksi_cetak_periode_defect",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataCetak;
};

const getCoating = async (startDate, endDate) => {
  const dataCoating = await InspeksiCoating.findAll({
    // include: [
    //   {
    //     model: InspeksiCoatingResultPeriode,
    //     as: "inspeksi_coating_result_periode",
    //     include: [
    //       {
    //         model: InspeksiCoatingResultPointPeriode,
    //         as: "inspeksi_coating_result_point_periode",
    //       },
    //       {
    //         model: User,
    //         as: "inspektor",
    //       },
    //     ],
    //   },
    //   {
    //     model: InspeksiCoatingSubPeriode,
    //     as: "inspeksi_coating_sub_periode",
    //   },
    //   {
    //     model: InspeksiCoatingResultAwal,
    //     as: "inspeksi_coating_result_awal",
    //     include: {
    //       model: User,
    //       as: "inspektor",
    //     },
    //   },
    //   {
    //     model: InspeksiCoatingSubAwal,
    //     as: "inspeksi_coating_sub_awal",
    //   },
    // ],
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataCoating;
};

const getPond = async (startDate, endDate) => {
  const dataPond = await InspeksiPond.findAll({
    // include: [
    //   {
    //     model: InspeksiPondAwal,
    //     as: "inspeksi_pond_awal",
    //     include: [
    //       {
    //         model: InspeksiPondAwalPoint,
    //         as: "inspeksi_pond_awal_point",
    //         include: {
    //           model: User,
    //           as: "inspektor",
    //         },
    //       },
    //     ],
    //   },
    //   {
    //     model: InspeksiPondPeriode,
    //     as: "inspeksi_pond_periode",
    //     include: [
    //       {
    //         model: InspeksiPondPeriodePoint,
    //         as: "inspeksi_pond_periode_point",
    //         include: [
    //           {
    //             model: User,
    //             as: "inspektor",
    //           },
    //           {
    //             model: InspeksiPondPeriodeDefect,
    //             as: "inspeksi_pond_periode_defect",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataPond;
};

const getSortirRs = async (startDate, endDate) => {
  const dataSortirRS = await InspeksiBarangRusakV2.findAll({
    // include: [
    //   {
    //     model: InspeksiBarangRusakPointV2,
    //     as: "inspeksi_barang_rusak_point_v2",
    //     include: [
    //       {
    //         model: InspeksiBarangRusakDefectV2,
    //         as: "inspeksi_barang_rusak_defect_v2",
    //       },
    //       {
    //         model: User,
    //         as: "inspektor",
    //       },
    //     ],
    //   },
    //   {
    //     model: User,
    //     as: "inspektor",
    //   },
    // ],
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataSortirRS;
};

const getSamplingRabut = async (startDate, endDate) => {
  const dataSamplingRabut = await InspeksiRabut.findAll({
    // include: {
    //   model: InspeksiRabutPoint,
    //   as: "inspeksi_rabut_point",
    //   include: [
    //     {
    //       model: User,
    //       as: "inspektor",
    //     },
    //     {
    //       model: InspeksiRabutDefect,
    //       as: "inspeksi_rabut_defect",
    //     },
    //   ],
    // },
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataSamplingRabut;
};

const getLem = async (startDate, endDate) => {
  const dataLem = await InspeksiLem.findAll({
    // include: [
    //   {
    //     model: InspeksiLemAwal,
    //     as: "inspeksi_lem_awal",
    //     include: [
    //       {
    //         model: InspeksiLemAwalPoint,
    //         as: "inspeksi_lem_awal_point",
    //         include: {
    //           model: User,
    //           as: "inspektor",
    //         },
    //       },
    //     ],
    //   },
    //   {
    //     model: InspeksiLemPeriode,
    //     as: "inspeksi_lem_periode",
    //     include: [
    //       {
    //         model: InspeksiLemPeriodePoint,
    //         as: "inspeksi_lem_periode_point",
    //         include: [
    //           {
    //             model: User,
    //             as: "inspektor",
    //           },
    //           {
    //             model: InspeksiLemPeriodeDefect,
    //             as: "inspeksi_lem_periode_defect",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataLem;
};

const getAmparLem = async (startDate, endDate) => {
  const dataAmparLem = await InspeksiAmparLem.findAll({
    // include: {
    //   model: InspeksiAmparLemPoint,
    //   as: "inspeksi_ampar_lem_point",
    //   include: [
    //     {
    //       model: User,
    //       as: "inspektor",
    //     },
    //     {
    //       model: InspeksiAmparLemDefect,
    //       as: "inspeksi_ampar_lem_defect",
    //     },
    //   ],
    // },
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataAmparLem;
};

const getPotongJadi = async (startDate, endDate) => {
  const dataPotongJadi = await InspeksiPotong.findAll({
    // include: {
    //   model: InspeksiPotongResult,
    //   as: "inspeksi_potong_result",
    // },
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
      jenis_potong: "potong jadi",
    },
  });
  return dataPotongJadi;
};

const getLipat = async (startDate, endDate) => {
  const dataLipat = await InspeksiLipat.findAll({
    // include: [
    //   { model: User, as: "inspektor" },
    //   {
    //     model: InspeksiLipatPoint,
    //     as: "inspeksi_lipat_point",
    //     include: [
    //       {
    //         model: InspeksiLipatResult,
    //         as: "inspeksi_lipat_result",
    //       },
    //       { model: User, as: "inspektor" },
    //     ],
    //   },
    // ],
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    },
  });
  return dataLipat;
};

const getFinalInspection = async (startDate, endDate) => {
  const dataFinalInspection = await InspeksiFinal.findAll({
    // include: [
    //   { model: InspeksiFinalSub, as: "inspeksi_final_sub" },
    //   { model: InspeksiFinalPoint, as: "inspeksi_final_point" },
    //   { model: User, as: "data_inspector" },
    // ],
    where: {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      bagian_tiket: "history",
    },
  });
  return dataFinalInspection;
};

module.exports = ReportQC;
