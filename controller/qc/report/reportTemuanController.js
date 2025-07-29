const { Op, Sequelize } = require("sequelize");

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
const User = require("../../../model/userModel");

const ReportTemuanQC = {
  getReportCheckseetTemuan: async (req, res) => {
    const { start_date, end_date, no_jo } = req.query;
    try {
      // Build query object lebih efisien
      const whereCondition = buildWhereCondition(start_date, end_date, no_jo);

      // Parallel execution untuk semua function get data
      const [
        dataCetak,
        dataCoating,
        dataPond,
        dataLem,
        dataSamplingRabut,
        dataSortirRs,
      ] = await Promise.all([
        getCetak(whereCondition),
        getCoating(whereCondition),
        getPond(whereCondition),
        getLem(whereCondition),
        getRabut(whereCondition),
        getBarangRusak(whereCondition),
      ]);

      // Optimized grouping dengan single loop
      const dataGrupMap = buildDataGroupMap([
        { data: dataCetak, key: "cetak" },
        { data: dataCoating, key: "coating" },
        { data: dataPond, key: "pond" },
        { data: dataLem, key: "lem" },
        { data: dataSamplingRabut, key: "sampling_rabut" },
        { data: dataSortirRs, key: "sortir_rs" },
      ]);

      const result = Array.from(dataGrupMap.values());
      res.status(200).json({ data: result });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

// Helper function untuk build where condition
const buildWhereCondition = (start_date, end_date, no_jo) => {
  if (no_jo) {
    return { no_jo, status: "history" };
  }

  if (start_date && end_date) {
    const startDate = new Date(start_date).setHours(0, 0, 0, 0);
    const endDate = new Date(end_date).setHours(23, 59, 59, 999);
    return {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
      status: "history",
    };
  }

  return { status: "history" };
};

// Optimized grouping function
const buildDataGroupMap = (dataArrays) => {
  const dataGrupMap = new Map();

  // Process semua data dalam satu loop
  dataArrays.forEach(({ data, key }) => {
    data.forEach((entry) => {
      const { no_jo, no_io, nama_produk } = entry;

      // Initialize group jika belum ada
      if (!dataGrupMap.has(no_jo)) {
        dataGrupMap.set(no_jo, {
          no_jo,
          no_io,
          item: nama_produk,
          cetak: [],
          coating: [],
          pond: [],
          lem: [],
          sortir_rs: [],
          sampling_rabut: [],
        });
      }

      // Push data ke array yang sesuai
      dataGrupMap.get(no_jo)[key].push(entry);
    });
  });

  return dataGrupMap;
};

const getCetak = async (whereCondition) => {
  const dataCetak = await InspeksiCetak.findAll({
    attributes: [
      "id",
      "no_jo",
      "no_io",
      "nama_produk",
      "customer",
      "operator",
      "mesin",
    ],
    include: [
      {
        model: InspeksiCetakPeriode,
        as: "inspeksi_cetak_periode",
        attributes: ["id"],
        include: [
          {
            model: InspeksiCetakPeriodePoint,
            as: "inspeksi_cetak_periode_point",
            include: [
              {
                model: User,
                as: "inspektor",
                attributes: ["id", "nama"],
              },
              {
                model: InspeksiCetakPeriodeDefect,
                as: "inspeksi_cetak_periode_defect",
                where: { hasil: "not ok" },
                required: true,
                //attributes: ["id", "hasil", "jenis_defect", "keterangan"], // Specify attributes yang dibutuhkan
              },
            ],
          },
        ],
      },
    ],
    where: whereCondition,
  });

  // Optimized flattening dengan reduce
  return dataCetak.reduce((result, item) => {
    const periode = item.inspeksi_cetak_periode?.[0];
    if (!periode?.inspeksi_cetak_periode_point) return result;

    const points = periode.inspeksi_cetak_periode_point;

    points.forEach((point, pointIndex) => {
      const defects = point.inspeksi_cetak_periode_defect || [];

      defects.forEach((defect) => {
        if (defect.hasil === "not ok") {
          result.push({
            ...defect.get({ plain: true }),
            bagian: "cetak",
            no_jo: item.no_jo,
            no_io: item.no_io,
            nama_produk: item.nama_produk,
            customer: item.customer,
            nama_inspektor: point.inspektor?.nama || null,
            periode_ke: pointIndex + 1,
            operator: item.operator,
            mesin: item.mesin,
          });
        }
      });
    });

    return result;
  }, []);
};

const getCoating = async (whereCondition) => {
  const dataCoating = await InspeksiCoating.findAll({
    attributes: [
      "id",
      "no_jo",
      "no_io",
      "nama_produk",
      "customer",
      "operator",
      "mesin",
    ],
    include: [
      {
        model: InspeksiCoatingResultPeriode,
        as: "inspeksi_coating_result_periode",
        attributes: ["id"],
        include: [
          {
            model: InspeksiCoatingResultPointPeriode,
            as: "inspeksi_coating_result_point_periode",
          },
          {
            model: User,
            as: "inspektor",
            attributes: ["id", "nama"],
          },
        ],
      },
    ],
    where: whereCondition,
  });

  // Optimized flattening dengan reduce
  return dataCoating.reduce((result, item) => {
    const points = item.inspeksi_coating_result_periode;

    points.forEach((point, pointIndex) => {
      const defects = point.inspeksi_coating_result_point_periode || [];

      defects.forEach((defect) => {
        if (defect.hasil === "not ok") {
          result.push({
            ...defect.get({ plain: true }),
            bagian: "coating",
            no_jo: item.no_jo,
            no_io: item.no_io,
            nama_produk: item.nama_produk,
            customer: item.customer,
            nama_inspektor: point.inspektor?.nama || null,
            periode_ke: pointIndex + 1,
            operator: item.operator,
            mesin: item.mesin,
          });
        }
      });
    });

    return result;
  }, []);
};

const getPond = async (whereCondition) => {
  const dataPond = await InspeksiPond.findAll({
    attributes: [
      "id",
      "no_jo",
      "no_io",
      "nama_produk",
      "customer",
      "operator",
      "mesin",
    ],
    include: [
      {
        model: InspeksiPondPeriode,
        as: "inspeksi_pond_periode",
        attributes: ["id"],
        include: [
          {
            model: InspeksiPondPeriodePoint,
            as: "inspeksi_pond_periode_point",
            include: [
              {
                model: User,
                as: "inspektor",
                attributes: ["id", "nama"],
              },
              {
                model: InspeksiPondPeriodeDefect,
                as: "inspeksi_pond_periode_defect",
                where: { hasil: "not ok" },
                required: true,
                //attributes: ["id", "hasil", "jenis_defect", "keterangan"], // Specify attributes yang dibutuhkan
              },
            ],
          },
        ],
      },
    ],
    where: whereCondition,
  });

  // Optimized flattening dengan reduce
  return dataPond.reduce((result, item) => {
    const periode = item.inspeksi_pond_periode?.[0];
    if (!periode?.inspeksi_pond_periode_point) return result;

    const points = periode.inspeksi_pond_periode_point;

    points.forEach((point, pointIndex) => {
      const defects = point.inspeksi_pond_periode_defect || [];

      defects.forEach((defect) => {
        if (defect.hasil === "not ok") {
          result.push({
            ...defect.get({ plain: true }),
            bagian: "pond",
            no_jo: item.no_jo,
            no_io: item.no_io,
            nama_produk: item.nama_produk,
            customer: item.customer,
            nama_inspektor: point.inspektor?.nama || null,
            periode_ke: pointIndex + 1,
            operator: item.operator,
            mesin: item.mesin,
          });
        }
      });
    });

    return result;
  }, []);
};

const getLem = async (whereCondition) => {
  const dataLem = await InspeksiLem.findAll({
    attributes: [
      "id",
      "no_jo",
      "no_io",
      "nama_produk",
      "customer",
      "operator",
      "mesin",
    ],
    include: [
      {
        model: InspeksiLemPeriode,
        as: "inspeksi_lem_periode",
        attributes: ["id"],
        include: [
          {
            model: InspeksiLemPeriodePoint,
            as: "inspeksi_lem_periode_point",
            include: [
              {
                model: User,
                as: "inspektor",
                attributes: ["id", "nama"],
              },
              {
                model: InspeksiLemPeriodeDefect,
                as: "inspeksi_lem_periode_defect",
                where: { hasil: "not ok" },
                required: true,
                //attributes: ["id", "hasil", "jenis_defect", "keterangan"], // Specify attributes yang dibutuhkan
              },
            ],
          },
        ],
      },
    ],
    where: whereCondition,
  });

  // Optimized flattening dengan reduce
  return dataLem.reduce((result, item) => {
    const periode = item.inspeksi_lem_periode?.[0];
    if (!periode?.inspeksi_lem_periode_point) return result;

    const points = periode.inspeksi_lem_periode_point;

    points.forEach((point, pointIndex) => {
      const defects = point.inspeksi_lem_periode_defect || [];

      defects.forEach((defect) => {
        if (defect.hasil === "not ok") {
          result.push({
            ...defect.get({ plain: true }),
            bagian: "lem",
            no_jo: item.no_jo,
            no_io: item.no_io,
            nama_produk: item.nama_produk,
            customer: item.customer,
            nama_inspektor: point.inspektor?.nama || null,
            periode_ke: pointIndex + 1,
            operator: item.operator,
            mesin: item.mesin,
          });
        }
      });
    });

    return result;
  }, []);
};

const getRabut = async (whereCondition) => {
  const dataRabut = await InspeksiRabut.findAll({
    attributes: [
      "id",
      "no_jo",
      "no_io",
      "nama_produk",
      "customer",
      "operator",
      "mesin",
    ],
    include: {
      model: InspeksiRabutPoint,
      as: "inspeksi_rabut_point",
      include: [
        {
          model: User,
          as: "inspektor",
          attributes: ["id", "nama"],
        },
        {
          model: InspeksiRabutDefect,
          as: "inspeksi_rabut_defect",
        },
      ],
    },
    where: whereCondition,
  });

  // Optimized flattening dengan reduce
  return dataRabut.reduce((result, item) => {
    const points = item.inspeksi_rabut_point;

    points.forEach((point, pointIndex) => {
      const defects = point.inspeksi_rabut_defect || [];

      defects.forEach((defect) => {
        result.push({
          ...defect.get({ plain: true }),
          bagian: "rabut",
          no_jo: item.no_jo,
          no_io: item.no_io,
          nama_produk: item.nama_produk,
          customer: item.customer,
          nama_inspektor: point.inspektor?.nama || null,
        });
      });
    });

    return result;
  }, []);
};

const getBarangRusak = async (whereCondition) => {
  const dataBarangRusak = await InspeksiBarangRusakV2.findAll({
    attributes: ["id", "no_jo", "no_io", "nama_produk", "customer"],
    include: {
      model: InspeksiBarangRusakPointV2,
      as: "inspeksi_barang_rusak_point_v2",
      include: [
        {
          model: User,
          as: "inspektor",
          attributes: ["id", "nama"],
        },
        {
          model: InspeksiBarangRusakDefectV2,
          as: "inspeksi_barang_rusak_defect_v2",
        },
      ],
    },
    where: whereCondition,
  });

  // Optimized flattening dengan reduce
  return dataBarangRusak.reduce((result, item) => {
    const points = item.inspeksi_barang_rusak_point_v2;

    points.forEach((point, pointIndex) => {
      const defects = point.inspeksi_barang_rusak_defect_v2 || [];

      defects.forEach((defect) => {
        result.push({
          ...defect.get({ plain: true }),
          bagian: "barang rusak",
          no_jo: item.no_jo,
          no_io: item.no_io,
          nama_produk: item.nama_produk,
          customer: item.customer,
          nama_inspektor: point.inspektor?.nama || null,
        });
      });
    });

    return result;
  }, []);
};

module.exports = ReportTemuanQC;
