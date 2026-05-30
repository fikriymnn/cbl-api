const { Op } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const InspeksiBahan = require("../../../model/qc/inspeksi/bahan/inspeksiBahanModel");
const InspeksiBahanResult = require("../../../model/qc/inspeksi/bahan/inspeksiBahanResultModel");

const InspeksiPotong = require("../../../model/qc/inspeksi/potong/inspeksiPotongModel");

const InspeksiCetak = require("../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const InspeksiCetakPeriode = require("../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");

const InspeksiCoating = require("../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");

const InspeksiPond = require("../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondAwal = require("../../../model/qc/inspeksi/pond/inspeksiPondAwalModel");
const InspeksiPondAwalPoint = require("../../../model/qc/inspeksi/pond/inspeksiPondAwalPointModel");
const InspeksiPondPeriode = require("../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");

const InspeksiBarangRusakV2 = require("../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Model");
const InspeksiBarangRusakPointV2 = require("../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");

const InspeksiRabutPoint = require("../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const InspeksiRabut = require("../../../model/qc/inspeksi/rabut/inspeksiRabutModel");

const InspeksiLem = require("../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemAwal = require("../../../model/qc/inspeksi/lem/inspeksiLemAwalModel");
const InspeksiLemAwalPoint = require("../../../model/qc/inspeksi/lem/inspeksiLemAwalPointModel");
const InspeksiLemPeriode = require("../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");

const InspeksiAmparLemPoint = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPointModel");
const InspeksiAmparLem = require("../../../model/qc/inspeksi/amparLem/inspeksiAmparLemModel");

const InspeksiLipat = require("../../../model/qc/inspeksi/lipat/inspeksiLipatModel");
const InspeksiLipatPoint = require("../../../model/qc/inspeksi/lipat/inspeksiLipatPointModel");

const InspeksiFinal = require("../../../model/qc/inspeksi/final/inspeksiFinalModel");

const User = require("../../../model/userModel");

// ─────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────
const hitungDurasiDetik = (mulai, selesai) =>
  Math.floor((new Date(selesai) - new Date(mulai)) / 1000);

const KATEGORI_LIST = [
  "incoming_bahan",
  "potong_bahan",
  "cetak",
  "coating",
  "pond",
  "sortir_rs",
  "sampling_rabut",
  "lem",
  "ampar_lem",
  "potong_jadi",
  "lipat",
  "final_inspection",
];

const buatSlotJo = (no_jo, no_io, item) => ({
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

/**
 * Tambahkan satu entri pekerjaan ke dalam map inspektor, lalu nested per no_jo.
 * Struktur: inspektorMap -> { inspektor_id, inspektor, jos: Map<no_jo, { no_jo, kategori[] }> }
 */
const pushToInspektorMap = (
  map,
  inspektorId,
  namaInspektor,
  kategori,
  entry,
) => {
  if (!inspektorId) return;

  if (!map.has(inspektorId)) {
    map.set(inspektorId, {
      inspektor_id: inspektorId,
      inspektor: namaInspektor,
      jos: new Map(), // no_jo -> slot kategori
    });
  }

  const inspektorData = map.get(inspektorId);
  const no_jo = entry.no_jo;
  const no_io = entry.no_io || null;
  const item = entry.item || entry.nama_produk || null;

  if (!inspektorData.jos.has(no_jo)) {
    inspektorData.jos.set(no_jo, buatSlotJo(no_jo, no_io, item));
  }

  inspektorData.jos.get(no_jo)[kategori].push(entry);
};

// ─────────────────────────────────────────────
// Query helpers (sama pola, dikembalikan flat + inspektor detail)
// ─────────────────────────────────────────────

const getPotongBahanByInspektor = async (obj) => {
  const data = await InspeksiPotong.findAll({
    include: [{ model: User, as: "inspektor", attributes: ["id", "nama"] }],
    where: obj,
  });

  return data.map((d) => {
    let waktu = 0;
    if (d.waktu_mulai && d.waktu_selesai)
      waktu = hitungDurasiDetik(d.waktu_mulai, d.waktu_selesai);

    const { inspektor, ...flatData } = d.toJSON();
    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor_id: inspektor?.id || null,
      inspektor: inspektor?.nama || null,
    };
  });
};

const getCetakByInspektor = async (obj) => {
  const data = await InspeksiCetak.findAll({
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
              { model: User, as: "inspektor", attributes: ["id", "nama"] },
            ],
          },
        ],
      },
    ],
    where: obj,
  });

  // Kumpulkan per inspektor dalam satu job cetak
  const hasil = [];
  data.forEach((d) => {
    // Map: inspektorId -> { waktu, inspektor_id, inspektor, no_jo, ... }
    const inspektorWaktuMap = new Map();

    const addPoint = (point) => {
      const id = point?.inspektor?.id;
      const nama = point?.inspektor?.nama;
      if (!id) return;
      if (!inspektorWaktuMap.has(id))
        inspektorWaktuMap.set(id, {
          inspektor_id: id,
          inspektor: nama,
          waktu: 0,
        });
      inspektorWaktuMap.get(id).waktu += hitungDurasiDetik(
        point.waktu_mulai,
        point.waktu_selesai,
      );
    };

    d.inspeksi_cetak_awal?.[0]?.inspeksi_cetak_awal_point?.forEach(addPoint);
    d.inspeksi_cetak_periode?.[0]?.inspeksi_cetak_periode_point?.forEach(
      addPoint,
    );

    const { inspeksi_cetak_awal, inspeksi_cetak_periode, ...flatData } =
      d.toJSON();

    inspektorWaktuMap.forEach(({ inspektor_id, inspektor, waktu }) => {
      hasil.push({
        ...flatData,
        inspektor_id,
        inspektor,
        lama_pengerjaan: waktu,
      });
    });
  });

  return hasil;
};

const getCoatingByInspektor = async (obj) => {
  const data = await InspeksiCoating.findAll({
    include: [
      {
        model: InspeksiCoatingResultPeriode,
        as: "inspeksi_coating_result_periode",
        attributes: ["id", "waktu_mulai", "waktu_selesai"],
        include: [{ model: User, as: "inspektor", attributes: ["id", "nama"] }],
      },
      {
        model: InspeksiCoatingResultAwal,
        as: "inspeksi_coating_result_awal",
        attributes: ["id", "waktu_mulai", "waktu_selesai"],
        include: { model: User, as: "inspektor", attributes: ["id", "nama"] },
      },
    ],
    where: obj,
  });

  const hasil = [];
  data.forEach((d) => {
    const inspektorWaktuMap = new Map();

    const addPoint = (point) => {
      const id = point?.inspektor?.id;
      const nama = point?.inspektor?.nama;
      if (!id) return;
      if (!inspektorWaktuMap.has(id))
        inspektorWaktuMap.set(id, {
          inspektor_id: id,
          inspektor: nama,
          waktu: 0,
        });
      inspektorWaktuMap.get(id).waktu += hitungDurasiDetik(
        point.waktu_mulai,
        point.waktu_selesai,
      );
    };

    d.inspeksi_coating_result_awal?.forEach(addPoint);
    d.inspeksi_coating_result_periode?.forEach(addPoint);

    const {
      inspeksi_coating_result_awal,
      inspeksi_coating_result_periode,
      ...flatData
    } = d.toJSON();

    inspektorWaktuMap.forEach(({ inspektor_id, inspektor, waktu }) => {
      hasil.push({
        ...flatData,
        inspektor_id,
        inspektor,
        lama_pengerjaan: waktu,
      });
    });
  });

  return hasil;
};

const getPondByInspektor = async (obj) => {
  const data = await InspeksiPond.findAll({
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
              { model: User, as: "inspektor", attributes: ["id", "nama"] },
            ],
          },
        ],
      },
    ],
    where: obj,
  });

  const hasil = [];
  data.forEach((d) => {
    const inspektorWaktuMap = new Map();

    const addPoint = (point) => {
      const id = point?.inspektor?.id;
      const nama = point?.inspektor?.nama;
      if (!id) return;
      if (!inspektorWaktuMap.has(id))
        inspektorWaktuMap.set(id, {
          inspektor_id: id,
          inspektor: nama,
          waktu: 0,
        });
      inspektorWaktuMap.get(id).waktu += hitungDurasiDetik(
        point.waktu_mulai,
        point.waktu_selesai,
      );
    };

    d.inspeksi_pond_awal?.[0]?.inspeksi_pond_awal_point?.forEach(addPoint);
    d.inspeksi_pond_periode?.[0]?.inspeksi_pond_periode_point?.forEach(
      addPoint,
    );

    const { inspeksi_pond_awal, inspeksi_pond_periode, ...flatData } =
      d.toJSON();

    inspektorWaktuMap.forEach(({ inspektor_id, inspektor, waktu }) => {
      hasil.push({
        ...flatData,
        inspektor_id,
        inspektor,
        lama_pengerjaan: waktu,
      });
    });
  });

  return hasil;
};

const getSortirRsByInspektor = async (obj) => {
  const data = await InspeksiBarangRusakV2.findAll({
    include: [
      {
        model: InspeksiBarangRusakPointV2,
        as: "inspeksi_barang_rusak_point_v2",
        attributes: ["id", "waktu_mulai", "waktu_selesai"],
        include: [{ model: User, as: "inspektor", attributes: ["id", "nama"] }],
      },
    ],
    where: obj,
  });

  const hasil = [];
  data.forEach((d) => {
    const inspektorWaktuMap = new Map();

    d.inspeksi_barang_rusak_point_v2?.forEach((point) => {
      const id = point?.inspektor?.id;
      const nama = point?.inspektor?.nama;
      if (!id) return;
      if (!inspektorWaktuMap.has(id))
        inspektorWaktuMap.set(id, {
          inspektor_id: id,
          inspektor: nama,
          waktu: 0,
        });
      inspektorWaktuMap.get(id).waktu += hitungDurasiDetik(
        point.waktu_mulai,
        point.waktu_selesai,
      );
    });

    const { inspeksi_barang_rusak_point_v2, ...flatData } = d.toJSON();

    inspektorWaktuMap.forEach(({ inspektor_id, inspektor, waktu }) => {
      hasil.push({
        ...flatData,
        inspektor_id,
        inspektor,
        lama_pengerjaan: waktu,
      });
    });
  });

  return hasil;
};

const getSamplingRabutByInspektor = async (obj) => {
  const data = await InspeksiRabut.findAll({
    include: {
      model: InspeksiRabutPoint,
      as: "inspeksi_rabut_point",
      attributes: ["id", "waktu_mulai", "waktu_selesai"],
      include: [{ model: User, as: "inspektor", attributes: ["id", "nama"] }],
    },
    where: obj,
  });

  const hasil = [];
  data.forEach((d) => {
    const inspektorWaktuMap = new Map();

    d.inspeksi_rabut_point?.forEach((point) => {
      const id = point?.inspektor?.id;
      const nama = point?.inspektor?.nama;
      if (!id) return;
      if (!inspektorWaktuMap.has(id))
        inspektorWaktuMap.set(id, {
          inspektor_id: id,
          inspektor: nama,
          waktu: 0,
        });
      inspektorWaktuMap.get(id).waktu += hitungDurasiDetik(
        point.waktu_mulai,
        point.waktu_selesai,
      );
    });

    const { inspeksi_rabut_point, ...flatData } = d.toJSON();

    inspektorWaktuMap.forEach(({ inspektor_id, inspektor, waktu }) => {
      hasil.push({
        ...flatData,
        inspektor_id,
        inspektor,
        lama_pengerjaan: waktu,
      });
    });
  });

  return hasil;
};

const getLemByInspektor = async (obj) => {
  const data = await InspeksiLem.findAll({
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
              { model: User, as: "inspektor", attributes: ["id", "nama"] },
            ],
          },
        ],
      },
    ],
    where: obj,
  });

  const hasil = [];
  data.forEach((d) => {
    const inspektorWaktuMap = new Map();

    const addPoint = (point) => {
      const id = point?.inspektor?.id;
      const nama = point?.inspektor?.nama;
      if (!id) return;
      if (!inspektorWaktuMap.has(id))
        inspektorWaktuMap.set(id, {
          inspektor_id: id,
          inspektor: nama,
          waktu: 0,
        });
      inspektorWaktuMap.get(id).waktu += hitungDurasiDetik(
        point.waktu_mulai,
        point.waktu_selesai,
      );
    };

    d.inspeksi_lem_awal?.[0]?.inspeksi_lem_awal_point?.forEach(addPoint);
    d.inspeksi_lem_periode?.[0]?.inspeksi_lem_periode_point?.forEach(addPoint);

    const { inspeksi_lem_awal, inspeksi_lem_periode, ...flatData } = d.toJSON();

    inspektorWaktuMap.forEach(({ inspektor_id, inspektor, waktu }) => {
      hasil.push({
        ...flatData,
        inspektor_id,
        inspektor,
        lama_pengerjaan: waktu,
      });
    });
  });

  return hasil;
};

const getAmparLemByInspektor = async (obj) => {
  const data = await InspeksiAmparLem.findAll({
    include: {
      model: InspeksiAmparLemPoint,
      as: "inspeksi_ampar_lem_point",
      attributes: ["id", "waktu_mulai", "waktu_selesai"],
      include: [{ model: User, as: "inspektor", attributes: ["id", "nama"] }],
    },
    where: obj,
  });

  const hasil = [];
  data.forEach((d) => {
    const inspektorWaktuMap = new Map();

    d.inspeksi_ampar_lem_point?.forEach((point) => {
      const id = point?.inspektor?.id;
      const nama = point?.inspektor?.nama;
      if (!id) return;
      if (!inspektorWaktuMap.has(id))
        inspektorWaktuMap.set(id, {
          inspektor_id: id,
          inspektor: nama,
          waktu: 0,
        });
      inspektorWaktuMap.get(id).waktu += hitungDurasiDetik(
        point.waktu_mulai,
        point.waktu_selesai,
      );
    });

    const { inspeksi_ampar_lem_point, ...flatData } = d.toJSON();

    inspektorWaktuMap.forEach(({ inspektor_id, inspektor, waktu }) => {
      hasil.push({
        ...flatData,
        inspektor_id,
        inspektor,
        lama_pengerjaan: waktu,
      });
    });
  });

  return hasil;
};

const getPotongJadiByInspektor = async (obj) => {
  const data = await InspeksiPotong.findAll({
    include: [{ model: User, as: "inspektor", attributes: ["id", "nama"] }],
    where: obj,
  });

  return data.map((d) => {
    let waktu = 0;
    if (d.waktu_mulai && d.waktu_selesai)
      waktu = hitungDurasiDetik(d.waktu_mulai, d.waktu_selesai);

    const { inspektor, ...flatData } = d.toJSON();
    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor_id: inspektor?.id || null,
      inspektor: inspektor?.nama || null,
    };
  });
};

const getLipatByInspektor = async (obj) => {
  const data = await InspeksiLipat.findAll({
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

  const hasil = [];
  data.forEach((d) => {
    const inspektorWaktuMap = new Map();

    d.inspeksi_lipat_point?.forEach((point) => {
      const id = point?.inspektor?.id;
      const nama = point?.inspektor?.nama;
      if (!id) return;
      if (!inspektorWaktuMap.has(id))
        inspektorWaktuMap.set(id, {
          inspektor_id: id,
          inspektor: nama,
          waktu: 0,
        });
      inspektorWaktuMap.get(id).waktu += hitungDurasiDetik(
        point.waktu_mulai,
        point.waktu_selesai,
      );
    });

    const { inspeksi_lipat_point, ...flatData } = d.toJSON();

    inspektorWaktuMap.forEach(({ inspektor_id, inspektor, waktu }) => {
      hasil.push({
        ...flatData,
        inspektor_id,
        inspektor,
        lama_pengerjaan: waktu,
      });
    });
  });

  return hasil;
};

const getFinalInspectionByInspektor = async (obj) => {
  const data = await InspeksiFinal.findAll({
    include: [
      { model: User, as: "data_inspector", attributes: ["id", "nama"] },
    ],
    where: obj,
  });

  return data.map((d) => {
    let waktu = 0;
    if (d.waktu_mulai && d.waktu_selesai)
      waktu = hitungDurasiDetik(d.waktu_mulai, d.waktu_selesai);

    const { data_inspector, ...flatData } = d.toJSON();
    return {
      ...flatData,
      lama_pengerjaan: waktu,
      inspektor_id: data_inspector?.id || null,
      inspektor: data_inspector?.nama || null,
    };
  });
};

// ─────────────────────────────────────────────
// Main Controller
// ─────────────────────────────────────────────
const ReportQCByInspektor = {
  getReportByInspektor: async (req, res) => {
    const { start_date, end_date, no_jo, inspektor_id } = req.query;
    try {
      let obj = {};
      let objPotongBahan = {};
      let objPotongJadi = {};
      let objFinalInspection = {};

      // ── Filter tanggal ──
      if (start_date && end_date) {
        const startDate = new Date(start_date).setHours(0, 0, 0, 0);
        const endDate = new Date(end_date).setHours(23, 59, 59, 999);

        obj = {
          createdAt: { [Op.between]: [startDate, endDate] },
          status: "history",
        };
        objPotongBahan = { ...obj, jenis_potong: "potong bahan" };
        objPotongJadi = { ...obj, jenis_potong: "potong jadi" };
        objFinalInspection = {
          createdAt: { [Op.between]: [startDate, endDate] },
          bagian_tiket: "history",
        };
      }

      // ── Filter no_jo ──
      if (no_jo) {
        obj = { no_jo: { [Op.like]: `%${no_jo}%` }, status: "history" };
        objPotongBahan = { ...obj, jenis_potong: "potong bahan" };
        objPotongJadi = { ...obj, jenis_potong: "potong jadi" };
        objFinalInspection = {
          no_jo: { [Op.like]: `%${no_jo}%` },
          bagian_tiket: "history",
        };
      }

      // ── Ambil semua data secara paralel ──
      const [
        dataPotongBahan,
        dataCetak,
        dataCoating,
        dataPond,
        dataSortirRS,
        dataSamplingRabut,
        dataLem,
        dataAmparLem,
        dataPotongJadi,
        dataLipat,
        dataFinalInspection,
      ] = await Promise.all([
        getPotongBahanByInspektor(objPotongBahan),
        getCetakByInspektor(obj),
        getCoatingByInspektor(obj),
        getPondByInspektor(obj),
        getSortirRsByInspektor(obj),
        getSamplingRabutByInspektor(obj),
        getLemByInspektor(obj),
        getAmparLemByInspektor(obj),
        getPotongJadiByInspektor(objPotongJadi),
        getLipatByInspektor(obj),
        getFinalInspectionByInspektor(objFinalInspection),
      ]);

      // ── Kelompokkan per inspektor ──
      const inspektorMap = new Map();

      dataPotongBahan.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "potong_bahan",
          e,
        ),
      );
      dataCetak.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "cetak",
          e,
        ),
      );
      dataCoating.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "coating",
          e,
        ),
      );
      dataPond.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "pond",
          e,
        ),
      );
      dataSortirRS.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "sortir_rs",
          e,
        ),
      );
      dataSamplingRabut.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "sampling_rabut",
          e,
        ),
      );
      dataLem.forEach((e) =>
        pushToInspektorMap(inspektorMap, e.inspektor_id, e.inspektor, "lem", e),
      );
      dataAmparLem.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "ampar_lem",
          e,
        ),
      );
      dataPotongJadi.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "potong_jadi",
          e,
        ),
      );
      dataLipat.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "lipat",
          e,
        ),
      );
      dataFinalInspection.forEach((e) =>
        pushToInspektorMap(
          inspektorMap,
          e.inspektor_id,
          e.inspektor,
          "final_inspection",
          e,
        ),
      );

      // ── (Opsional) Filter hanya satu inspektor ──
      let result = Array.from(inspektorMap.values());
      if (inspektor_id) {
        result = result.filter(
          (d) => String(d.inspektor_id) === String(inspektor_id),
        );
      }

      // ── Flatten jos Map → array, hitung summary per jo dan per inspektor ──
      result = result.map((d) => {
        const josArray = Array.from(d.jos.values()).map((jo) => {
          // summary per jo
          const total_pekerjaan_jo = KATEGORI_LIST.reduce(
            (acc, k) => acc + (jo[k]?.length || 0),
            0,
          );
          const total_lama_pengerjaan_jo = KATEGORI_LIST.reduce(
            (acc, k) =>
              acc +
              (jo[k]?.reduce((s, e) => s + (e.lama_pengerjaan || 0), 0) || 0),
            0,
          );
          return {
            ...jo,
            total_pekerjaan: total_pekerjaan_jo,
            total_lama_pengerjaan: total_lama_pengerjaan_jo,
          };
        });

        // summary per inspektor (agregat dari semua jo)
        const total_pekerjaan = josArray.reduce(
          (acc, jo) => acc + jo.total_pekerjaan,
          0,
        );
        const total_lama_pengerjaan = josArray.reduce(
          (acc, jo) => acc + jo.total_lama_pengerjaan,
          0,
        );

        const { jos, ...inspektorFlat } = d;
        return {
          ...inspektorFlat,
          total_pekerjaan,
          total_lama_pengerjaan,
          jos: josArray,
        };
      });

      res.status(200).json({ data: result });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};

module.exports = ReportQCByInspektor;
