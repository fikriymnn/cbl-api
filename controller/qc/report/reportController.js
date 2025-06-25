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
    const { start_date, end_date, no_jo } = req.query;
    try {
      // if (!start_date)
      //   return res.status(404).json({ msg: "start_date required!!" });
      // if (!end_date)
      //   return res.status(404).json({ msg: "end_date required!!" });
      let obj = {};
      let objPotongBahan = {};
      let objPotongJadi = {};
      let objFinalInspection = {};
      if (start_date && end_date) {
        const startDate = new Date(start_date).setHours(0, 0, 0, 0);
        const endDate = new Date(end_date).setHours(23, 59, 59, 999);
        obj.createdAt = {
          [Op.between]: [startDate, endDate],
        };
        obj.status = "history";

        objPotongBahan.createdAt = {
          [Op.between]: [startDate, endDate],
        };
        objPotongBahan.status = "history";
        (objPotongBahan.jenis_potong = "potong bahan"),
          (objPotongJadi.createdAt = {
            [Op.between]: [startDate, endDate],
          });
        objPotongJadi.status = "history";
        (objPotongJadi.jenis_potong = "potong jadi"),
          (objFinalInspection.createdAt = {
            [Op.between]: [startDate, endDate],
          });
        objFinalInspection.bagian_tiket = "history";
      }

      if (no_jo) {
        obj = { no_jo: no_jo, status: "history" };
        objPotongBahan = {
          no_jo: no_jo,
          status: "history",
          jenis_potong: "potong bahan",
        };
        objPotongJadi = {
          no_jo: no_jo,
          status: "history",
          jenis_potong: "potong jadi",
        };
        objFinalInspection = { no_jo: no_jo, bagian_tiket: "history" };
      }

      const dataBahan = await getIncomingBahan(obj);
      const dataPotongBahan = await getPotongBahan(objPotongBahan);
      const dataCetak = await getCetak(obj);
      const dataCoating = await getCoating(obj);
      const dataPond = await getPond(obj);
      const dataSortirRS = await getSortirRs(obj);
      const dataSamplingRabut = await getSamplingRabut(obj);
      const dataLem = await getLem(obj);
      const dataAmparLem = await getAmparLem(obj);
      const dataPotongJadi = await getPotongJadi(objPotongJadi);
      const dataLipat = await getLipat(obj);
      const dataFinalInspection = await getFinalInspection(objFinalInspection);

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

const getIncomingBahan = async (obj) => {
  const dataBahan = await InspeksiBahan.findAll({
    // include: { model: InspeksiBahanResult, as: "inspeksi_bahan_result" },
    where: obj,
  });
  return dataBahan;
};

const getPotongBahan = async (obj) => {
  const dataPotongBahan = await InspeksiPotong.findAll({
    // include: {
    //   model: InspeksiPotongResult,
    //   as: "inspeksi_potong_result",
    // },
    where: obj,
  });

  const dataPotongResult = dataPotongBahan.map((data) => {
    let waktu = 0;
    if (data.waktu_mulai && data.waktu_selesai) {
      waktu += hitungDurasiDetik(data.waktu_mulai, data.waktu_selesai);
    }
    return {
      ...data.toJSON(),
      lama_pengerjaan: waktu,
    };
  });
  return dataPotongResult;
};

const getCetak = async (obj) => {
  const dataCetak = await InspeksiCetak.findAll({
    include: [
      {
        model: InspeksiCetakAwal,
        as: "inspeksi_cetak_awal",
        attributes: ["id"],
        include: [
          {
            model: InspeksiCetakAwalPoint,
            as: "inspeksi_cetak_awal_point",
            attributes: ["id", "waktu_mulai", "waktu_selesai"],
            include: {
              model: User,
              as: "inspektor",
              attributes: ["id", "nama"],
            },
          },
        ],
      },
      {
        model: InspeksiCetakPeriode,
        as: "inspeksi_cetak_periode",
        attributes: ["id"],
        include: [
          {
            model: InspeksiCetakPeriodePoint,
            as: "inspeksi_cetak_periode_point",
            attributes: ["id", "waktu_mulai", "waktu_selesai"],
            include: [
              {
                model: User,
                as: "inspektor",
                attributes: ["id", "nama"],
              },
            ],
          },
        ],
      },
    ],
    where: obj,
  });

  const dataCetakResult = dataCetak.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;

    if (data.inspeksi_cetak_awal?.[0]?.inspeksi_cetak_awal_point?.length > 0) {
      data.inspeksi_cetak_awal[0].inspeksi_cetak_awal_point.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });
    }

    if (
      data.inspeksi_cetak_periode?.[0]?.inspeksi_cetak_periode_point?.length > 0
    ) {
      const pointList =
        data.inspeksi_cetak_periode[0].inspeksi_cetak_periode_point;

      pointList.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });

      // Ambil inspektor terakhir (berdasarkan urutan array)
      const lastPoint = pointList[pointList.length - 1];
      namaInspektorTerakhir = lastPoint?.inspektor?.nama || null;
    }

    const { inspeksi_cetak_awal, inspeksi_cetak_periode, ...flatData } =
      data.toJSON();

    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });
  return dataCetakResult;
};

const getCoating = async (obj) => {
  const dataCoating = await InspeksiCoating.findAll({
    include: [
      {
        model: InspeksiCoatingResultPeriode,
        as: "inspeksi_coating_result_periode",
        attributes: ["id", "waktu_mulai", "waktu_selesai"],
        include: [
          {
            model: User,
            as: "inspektor",
            attributes: ["id", "nama"],
          },
        ],
      },

      {
        model: InspeksiCoatingResultAwal,
        as: "inspeksi_coating_result_awal",
        attributes: ["id", "waktu_mulai", "waktu_selesai"],
        include: {
          model: User,
          as: "inspektor",
          attributes: ["id", "nama"],
        },
      },
    ],
    where: obj,
  });

  const dataCoatingResult = dataCoating.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;

    if (data.inspeksi_coating_result_periode?.length > 0) {
      data.inspeksi_coating_result_periode.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });
    }

    if (data.inspeksi_coating_result_awal?.length > 0) {
      const pointList = data.inspeksi_coating_result_awal;

      pointList.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });

      // Ambil inspektor terakhir (berdasarkan urutan array)
      const lastPoint = pointList[pointList.length - 1];
      namaInspektorTerakhir = lastPoint?.inspektor?.nama || null;
    }

    const {
      inspeksi_coating_result_periode,
      inspeksi_coating_result_awal,
      ...flatData
    } = data.toJSON();

    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });
  return dataCoatingResult;
};

const getPond = async (obj) => {
  const dataPond = await InspeksiPond.findAll({
    include: [
      {
        model: InspeksiPondAwal,
        as: "inspeksi_pond_awal",
        attributes: ["id"],
        include: [
          {
            model: InspeksiPondAwalPoint,
            as: "inspeksi_pond_awal_point",
            attributes: ["id", "waktu_mulai", "waktu_selesai"],
            include: {
              model: User,
              as: "inspektor",
              attributes: ["id", "nama"],
            },
          },
        ],
      },
      {
        model: InspeksiPondPeriode,
        as: "inspeksi_pond_periode",
        include: [
          {
            model: InspeksiPondPeriodePoint,
            as: "inspeksi_pond_periode_point",
            attributes: ["id", "waktu_mulai", "waktu_selesai"],
            include: [
              {
                model: User,
                as: "inspektor",
                attributes: ["id", "nama"],
              },
            ],
          },
        ],
      },
    ],
    where: obj,
  });

  const dataPondResult = dataPond.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;

    if (data.inspeksi_pond_awal?.[0]?.inspeksi_pond_awal_point?.length > 0) {
      data.inspeksi_pond_awal[0].inspeksi_pond_awal_point.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });
    }

    if (
      data.inspeksi_pond_periode?.[0]?.inspeksi_pond_periode_point?.length > 0
    ) {
      const pointList =
        data.inspeksi_pond_periode[0].inspeksi_pond_periode_point;

      pointList.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });

      // Ambil inspektor terakhir (berdasarkan urutan array)
      const lastPoint = pointList[pointList.length - 1];
      namaInspektorTerakhir = lastPoint?.inspektor?.nama || null;
    }

    const { inspeksi_pond_awal, inspeksi_pond_periode, ...flatData } =
      data.toJSON();

    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });
  return dataPondResult;
};

const getSortirRs = async (obj) => {
  const dataSortirRS = await InspeksiBarangRusakV2.findAll({
    include: [
      {
        model: InspeksiBarangRusakPointV2,
        as: "inspeksi_barang_rusak_point_v2",
        attributes: ["id", "waktu_mulai", "waktu_selesai"],
        include: [
          {
            model: User,
            as: "inspektor",
            attributes: ["id", "nama"],
          },
        ],
      },
    ],
    where: obj,
  });

  const dataSortirRSResult = dataSortirRS.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;

    if (data.inspeksi_barang_rusak_point_v2?.length > 0) {
      const pointList = data.inspeksi_barang_rusak_point_v2;

      pointList.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });

      // Ambil inspektor terakhir (berdasarkan urutan array)
      const lastPoint = pointList[pointList.length - 1];
      namaInspektorTerakhir = lastPoint?.inspektor?.nama || null;
    }

    const { inspeksi_barang_rusak_point_v2, ...flatData } = data.toJSON();

    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });
  return dataSortirRSResult;
};

const getSamplingRabut = async (obj) => {
  const dataSamplingRabut = await InspeksiRabut.findAll({
    include: {
      model: InspeksiRabutPoint,
      as: "inspeksi_rabut_point",
      attributes: ["id", "waktu_mulai", "waktu_selesai"],
      include: [
        {
          model: User,
          as: "inspektor",
          attributes: ["id", "nama"],
        },
      ],
    },
    where: obj,
  });

  const dataSamplingRabutResult = dataSamplingRabut.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;

    if (data.inspeksi_rabut_point?.length > 0) {
      const pointList = data.inspeksi_rabut_point;

      pointList.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });

      // Ambil inspektor terakhir (berdasarkan urutan array)
      const lastPoint = pointList[pointList.length - 1];
      namaInspektorTerakhir = lastPoint?.inspektor?.nama || null;
    }

    const { inspeksi_rabut_point, ...flatData } = data.toJSON();

    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });
  return dataSamplingRabutResult;
};

const getLem = async (obj) => {
  const dataLem = await InspeksiLem.findAll({
    include: [
      {
        model: InspeksiLemAwal,
        as: "inspeksi_lem_awal",
        attributes: ["id"],
        include: [
          {
            model: InspeksiLemAwalPoint,
            as: "inspeksi_lem_awal_point",
            attributes: ["id", "waktu_mulai", "waktu_selesai"],
            include: {
              model: User,
              as: "inspektor",
              attributes: ["id", "nama"],
            },
          },
        ],
      },
      {
        model: InspeksiLemPeriode,
        as: "inspeksi_lem_periode",
        attributes: ["id"],
        include: [
          {
            model: InspeksiLemPeriodePoint,
            as: "inspeksi_lem_periode_point",
            attributes: ["id", "waktu_mulai", "waktu_selesai"],
            include: [
              {
                model: User,
                as: "inspektor",
                attributes: ["id", "nama"],
              },
            ],
          },
        ],
      },
    ],
    where: obj,
  });

  const dataLemResult = dataLem.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;

    if (data.inspeksi_lem_awal?.[0]?.inspeksi_lem_awal_point?.length > 0) {
      data.inspeksi_lem_awal[0].inspeksi_lem_awal_point.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });
    }

    if (
      data.inspeksi_lem_periode?.[0]?.inspeksi_lem_periode_point?.length > 0
    ) {
      const pointList = data.inspeksi_lem_periode[0].inspeksi_lem_periode_point;

      pointList.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });

      // Ambil inspektor terakhir (berdasarkan urutan array)
      const lastPoint = pointList[pointList.length - 1];
      namaInspektorTerakhir = lastPoint?.inspektor?.nama || null;
    }

    const { inspeksi_lem_awal, inspeksi_lem_periode, ...flatData } =
      data.toJSON();

    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });
  return dataLemResult;
};

const getAmparLem = async (obj) => {
  const dataAmparLem = await InspeksiAmparLem.findAll({
    include: {
      model: InspeksiAmparLemPoint,
      as: "inspeksi_ampar_lem_point",
      attributes: ["id", "waktu_mulai", "waktu_selesai"],
      include: [
        {
          model: User,
          as: "inspektor",
          attributes: ["id", "nama"],
        },
      ],
    },
    where: obj,
  });

  const dataAmparLemResult = dataAmparLem.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;

    if (data.inspeksi_ampar_lem_point?.length > 0) {
      const pointList = data.inspeksi_ampar_lem_point;

      pointList.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });

      // Ambil inspektor terakhir (berdasarkan urutan array)
      const lastPoint = pointList[pointList.length - 1];
      namaInspektorTerakhir = lastPoint?.inspektor?.nama || null;
    }

    const { inspeksi_ampar_lem_point, ...flatData } = data.toJSON();

    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });
  return dataAmparLemResult;
};

const getPotongJadi = async (obj) => {
  const dataPotongJadi = await InspeksiPotong.findAll({
    // include: {
    //   model: InspeksiPotongResult,
    //   as: "inspeksi_potong_result",
    // },
    where: obj,
  });
  const dataPotongResult = dataPotongJadi.map((data) => {
    let waktu = 0;
    if (data.waktu_mulai && data.waktu_selesai) {
      waktu += hitungDurasiDetik(data.waktu_mulai, data.waktu_selesai);
    }
    return {
      ...data.toJSON(),
      lama_pengerjaan: waktu,
    };
  });
  return dataPotongResult;
};

const getLipat = async (obj) => {
  const dataLipat = await InspeksiLipat.findAll({
    include: [
      {
        model: InspeksiLipatPoint,
        as: "inspeksi_lipat_point",
        attributes: ["id", "waktu_mulai", "waktu_selesai"],
        include: [{ model: User, as: "inspektor", attributes: ["id", "nama"] }],
      },
    ],
    where: obj,
  });

  const dataLipatResult = dataLipat.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;

    if (data.inspeksi_lipat_point?.length > 0) {
      const pointList = data.inspeksi_lipat_point;

      pointList.forEach((dA) => {
        waktu += hitungDurasiDetik(dA.waktu_mulai, dA.waktu_selesai);
      });

      // Ambil inspektor terakhir (berdasarkan urutan array)
      const lastPoint = pointList[pointList.length - 1];
      namaInspektorTerakhir = lastPoint?.inspektor?.nama || null;
    }

    const { inspeksi_lipat_point, ...flatData } = data.toJSON();

    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });
  return dataLipatResult;
};

const getFinalInspection = async (obj) => {
  const dataFinalInspection = await InspeksiFinal.findAll({
    include: [{ model: User, as: "data_inspector" }],
    where: obj,
  });

  const dataFinalInspectionResult = dataFinalInspection.map((data) => {
    let waktu = 0;
    let namaInspektorTerakhir = null;
    if (data.waktu_mulai && data.waktu_selesai) {
      waktu += hitungDurasiDetik(data.waktu_mulai, data.waktu_selesai);
    }

    namaInspektorTerakhir = data.data_inspector?.nama || null;
    const { data_inspector, ...flatData } = data.toJSON();
    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor: namaInspektorTerakhir,
    };
  });

  return dataFinalInspectionResult;
};

const hitungDurasiDetik = (mulai, selesai) =>
  Math.floor((new Date(selesai) - new Date(mulai)) / 1000);

module.exports = ReportQC;
