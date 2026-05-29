const { Op, Sequelize } = require("sequelize");
const ProduksiLkhProses = require("../../model/produksi/produksiLkhProsesModel");
const MasterKodeProduksi = require("../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterKategoriKendala = require("../../model/masterData/kodeProduksi/masterKategoriKendalaModel");
const MasterTahapan = require("../../model/masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../../model/masterData/tahapan/masterMesinTahapanModel");
const JobOrder = require("../../model/ppic/jobOrder/jobOrderModel");
const Users = require("../../model/userModel");

// ─── Helper ───────────────────────────────────────────────────────────────────

const secondsToHours = (seconds) => parseFloat((seconds / 3600).toFixed(4));

/**
 * Hitung rekap dari array rows (bisa semua data atau subset per operator)
 */
function hitungRekap(rows) {
  let totalWaktuSetting = 0;
  let totalWaktuProduksi = 0;
  let totalWaktuKendala = 0;
  let totalWaktuOff = 0;

  let totalQtyBaik = 0;
  let totalQtyRusakSebagian = 0;
  let totalQtyRusakTotal = 0;

  const detailSetting = [];
  const detailProduksi = [];
  const detailKendala = [];
  const detailOff = [];

  // Untuk rekap kendala per kategori: Map<kategoriLabel, { total_waktu, rows[] }>
  const kendalaMap = new Map();

  // Untuk unique JO
  const joSet = new Set();
  const joProduktifSet = new Set();
  const joProofSet = new Set();

  for (const row of rows) {
    const proses = row.proses;
    const waktu = parseInt(row.total_waktu) || 0;
    const noJo = row.jo?.no_jo;
    const tipeJo = row.jo?.tipe_jo;

    // Unique JO
    if (noJo) {
      joSet.add(noJo);
      if (tipeJo === "JO PRODUKSI") joProduktifSet.add(noJo);
      if (tipeJo === "JO PROOF") joProofSet.add(noJo);
    }

    // Akumulasi waktu & detail per proses
    if (proses === "Setting") {
      totalWaktuSetting += waktu;
      detailSetting.push(buildDetail(row));
    } else if (proses === "Produksi") {
      totalWaktuProduksi += waktu;
      detailProduksi.push(buildDetail(row));
    } else if (proses === "Kendala") {
      totalWaktuKendala += waktu;
      detailKendala.push(buildDetail(row));

      // Kelompokkan kendala per kategori
      const kategoriLabel =
        row.kode_produksi?.kategori_kendala?.kategori ?? "Tidak Berkategori";
      if (!kendalaMap.has(kategoriLabel)) {
        kendalaMap.set(kategoriLabel, { total_waktu: 0, rows: [] });
      }
      const entry = kendalaMap.get(kategoriLabel);
      entry.total_waktu += waktu;
      entry.rows.push(buildDetail(row));
    } else if (proses === "Off") {
      totalWaktuOff += waktu;
      detailOff.push(buildDetail(row));
    }

    // Qty hanya dari final result
    if (row.is_final_result) {
      totalQtyBaik += parseInt(row.baik) || 0;
      totalQtyRusakSebagian += parseInt(row.rusak_sebagian) || 0;
      totalQtyRusakTotal += parseInt(row.rusak_total) || 0;
    }
  }

  const totalQtyProduksi =
    totalQtyBaik + totalQtyRusakSebagian + totalQtyRusakTotal;
  const totalJam = secondsToHours(
    totalWaktuSetting + totalWaktuProduksi + totalWaktuKendala + totalWaktuOff
  );

  // Net output: qty produksi / (setting + produksi + kendala) dalam JAM
  const pembagi = secondsToHours(
    totalWaktuSetting + totalWaktuProduksi + totalWaktuKendala
  );
  const netOutput =
    pembagi > 0 ? parseFloat((totalQtyProduksi / pembagi).toFixed(4)) : 0;

  // Rekap kendala per kategori
  const rekapKendala = [];
  for (const [kategori, entry] of kendalaMap.entries()) {
    rekapKendala.push({
      kategori_kendala: kategori,
      total_waktu_detik: entry.total_waktu,
      total_waktu_jam: secondsToHours(entry.total_waktu),
      persentase:
        totalWaktuKendala > 0
          ? parseFloat(
              ((entry.total_waktu / totalWaktuKendala) * 100).toFixed(2)
            )
          : 0,
      data_kendala: entry.rows,
    });
  }

  return {
    rekap_mesin: {
      total_waktu_setting_jam: secondsToHours(totalWaktuSetting),
      detail_setting: detailSetting,
      total_waktu_produksi_jam: secondsToHours(totalWaktuProduksi),
      detail_produksi: detailProduksi,
      total_waktu_kendala_jam: secondsToHours(totalWaktuKendala),
      detail_kendala: detailKendala,
      total_waktu_off_jam: secondsToHours(totalWaktuOff),
      detail_off: detailOff,
      total_jam: totalJam,
      total_qty_baik: totalQtyBaik,
      total_qty_rusak_sebagian: totalQtyRusakSebagian,
      total_qty_rusak_total: totalQtyRusakTotal,
      total_qty_produksi: totalQtyProduksi,
      net_output: netOutput,
      total_jo: joSet.size,
      total_jo_produksi: joProduktifSet.size,
      total_jo_proof: joProofSet.size,
    },
    rekap_kendala: rekapKendala,
  };
}

/**
 * Ambil field yang relevan dari satu row untuk detail
 */
function buildDetail(row) {
  return {
    id: row.id,
    id_jo: row.id_jo,
    no_jo: row.jo?.no_jo,
    no_io: row.jo?.no_io,
    tipe_jo: row.jo?.tipe_jo,
    produk: row.jo?.produk,
    customer: row.jo?.customer,
    kode: row.kode,
    deskripsi: row.deskripsi,
    proses: row.proses,
    baik: row.baik,
    rusak_sebagian: row.rusak_sebagian,
    rusak_total: row.rusak_total,
    total_waktu_detik: parseInt(row.total_waktu) || 0,
    total_waktu_jam: secondsToHours(parseInt(row.total_waktu) || 0),
    waktu_mulai: row.waktu_mulai,
    waktu_selesai: row.waktu_selesai,
    is_final_result: row.is_final_result,
    note: row.note,
    status: row.status,
    operator: row.operator,
    kategori_kendala: row.kode_produksi?.kategori_kendala ?? null,
  };
}

// ─── Controller ───────────────────────────────────────────────────────────────

const ProduksiLkhRekapController = {
  getProduksiLkhRekap: async (req, res) => {
    const { start_date, end_date, id_mesin, id_tahapan } = req.query;

    if (!start_date || !end_date || !id_mesin) {
      return res.status(400).json({
        status_code: 400,
        success: false,
        msg: "start_date, end_date,dan id_mesin harus diisi",
      });
    }

    const whereClause = {
      total_waktu: { [Op.ne]: null },
      id_mesin,
      createdAt: {
        [Op.between]: [
          new Date(start_date).setHours(0, 0, 0, 0),
          new Date(end_date).setHours(23, 59, 59, 999),
        ],
      },
    };

    if (id_tahapan) whereClause.id_tahapan = id_tahapan;

    try {
      // Ambil hanya kolom yang dibutuhkan untuk kalkulasi (lean query)
      const rows = await ProduksiLkhProses.findAll({
        where: whereClause,
        attributes: [
          "id",
          "id_jo",
          "id_operator",
          "id_kode_produksi",
          "kode",
          "deskripsi",
          "proses",
          "baik",
          "rusak_sebagian",
          "rusak_total",
          "total_waktu",
          "waktu_mulai",
          "waktu_selesai",
          "is_final_result",
          "note",
          "status",
        ],
        include: [
          {
            model: JobOrder,
            as: "jo",
            attributes: [
              "id",
              "no_jo",
              "tipe_jo",
              "produk",
              "no_io",
              "customer",
            ],
          },
          {
            model: MasterKodeProduksi,
            as: "kode_produksi",
            attributes: ["id", "proses_produksi", "kode", "deskripsi"],
            include: [
              {
                model: MasterKategoriKendala,
                as: "kategori_kendala",
                attributes: ["id", "kategori"],
              },
            ],
          },
          {
            model: Users,
            as: "operator",
            attributes: ["id", "nama"],
          },
        ],
        // Hindari overhead instance Sequelize, gunakan plain object
        raw: false, // harus false karena ada nested include
        nest: true,
      });

      // ── Kalkulasi rekap mesin (semua data) ──────────────────────────────────
      const { rekap_mesin, rekap_kendala } = hitungRekap(rows);

      // ── Kalkulasi rekap per operator ────────────────────────────────────────
      // Kelompokkan rows per operator dengan single-pass O(n)
      const operatorMap = new Map();
      for (const row of rows) {
        const opId = row.id_operator;
        const opNama = row.operator?.nama ?? "Unknown";
        if (!operatorMap.has(opId)) {
          operatorMap.set(opId, {
            id_operator: opId,
            nama_operator: opNama,
            rows: [],
          });
        }
        operatorMap.get(opId).rows.push(row);
      }

      const rekap_operator = [];
      for (const [, opEntry] of operatorMap.entries()) {
        const { rekap_mesin: rm, rekap_kendala: rk } = hitungRekap(
          opEntry.rows
        );
        rekap_operator.push({
          id_operator: opEntry.id_operator,
          nama_operator: opEntry.nama_operator,
          rekap_mesin: rm,
          rekap_kendala: rk,
        });
      }

      return res.status(200).json({
        status_code: 200,
        success: true,
        rekap_mesin,
        rekap_kendala,
        rekap_operator,
      });
    } catch (error) {
      return res.status(500).json({
        status_code: 500,
        success: false,
        msg: error.message,
      });
    }
  },
};

module.exports = ProduksiLkhRekapController;
