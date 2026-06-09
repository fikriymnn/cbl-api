const { Op, fn, col, literal } = require("sequelize");
const SoModel = require("../../../model/marketing/so/soModel");
const JoModel = require("../../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../../model/ppic/jobOrder/joMountingModel");
const DeliveriOrderModel = require("../../../model/deliveryOrder/deliveryOrderModel");
const DeliveriOrderGrupModel = require("../../../model/deliveryOrder/deliveryOrderGroupModel");
const ProduksiLkhTahapan = require("../../../model/produksi/produksiLkhTahapanModel");
const MasterMesinTahapan = require("../../../model/masterData/tahapan/masterMesinTahapanModel");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const ProduksiLkhProses = require("../../../model/produksi/produksiLkhProsesModel");
const MasterKaryawan = require("../../../model/hr/karyawanModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");
const Kalkulasi = require("../../../model/marketing/kalkulasi/kalkulasiModel");

const MonitoringSoController = {
  getSoMonitoring: async (req, res) => {
    const {
      start_date,
      end_date,
      id_customer,
      id_marketing,
      sort_by,
      status_po,
      no_so,
    } = req.query;

    try {
      let obj = { status: "history" };

      // ─── Validasi parameter wajib ─────────────────────────────────────────────
      if (!start_date || !end_date || !sort_by || !status_po)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "start date, end date, sort by, dan status po wajib di isi",
        });

      const startDate = new Date(start_date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end_date);
      endDate.setHours(23, 59, 59, 999);

      // ─── Subquery total qty terkirim di level SO ──────────────────────────────
      // Total semua DO milik SO ini lintas semua group — untuk rekap & post-filter.
      // ─────────────────────────────────────────────────────────────────────────
      const subqueryTotalQty = literal(`(
        SELECT COALESCE(SUM(do_inner.jumlah_qty), 0)
        FROM delivery_order AS do_inner
        WHERE do_inner.id_so = so.id
          AND do_inner.is_active = 1
      )`);

      const KalkulasiInclude = {
        model: Kalkulasi,
        as: "kalkulasi",
        attributes: ["id", "id_marketing", "nama_marketing"],
        duplicating: false,
      };

      // ─── Filter sort_by ───────────────────────────────────────────────────────
      if (sort_by == "input so") {
        obj.createdAt = { [Op.between]: [startDate, endDate] };
      } else if (sort_by == "kirim so") {
        obj.tgl_pengiriman = { [Op.between]: [startDate, endDate] };
      } else if (sort_by == "do") {
        // Filter SO yang punya DO dalam rentang tanggal — via subquery EXISTS
        obj[Op.and] = literal(`EXISTS (
          SELECT 1
          FROM delivery_order_group dog
          JOIN delivery_order do2 ON do2.id_do_group = dog.id
            AND do2.id_so = so.id
            AND do2.is_active = 1
          WHERE dog.tgl_do BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'
            AND dog.is_active = 1
        )`);
      } else {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "sort by tidak ada dalam pilihan yang disediakan",
        });
      }

      // ─── Filter status_po ─────────────────────────────────────────────────────
      if (status_po == "semua") {
      } else if (status_po == "close") {
        obj.status_work = "done";
      } else if (status_po == "cancel") {
        obj.status = "cancel";
      } else if (status_po == "kurang qty") {
        obj.status_work = { [Op.ne]: "done" };
      } else if (
        status_po == "belum kirim" ||
        status_po == "selesai" ||
        status_po == "over qty"
      ) {
        // ditangani post-filter
      } else {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "status po tidak ada dalam pilihan yang disediakan",
        });
      }

      // ─── Filter id_marketing ──────────────────────────────────────────────────
      if (id_marketing) {
        KalkulasiInclude.where = { id_marketing };
        KalkulasiInclude.required = true;
      }

      if (id_customer) obj.id_customer = id_customer;

      //jika pakai no_so maka filter yg lain di matikan hanya filter no_so saja yang di gunakan
      if (no_so)
        obj = { status: "history", no_so: { [Op.like]: `%${no_so}%` } };

      // ─── Query utama — tanpa DoInclude ────────────────────────────────────────
      // DO group di-fetch manual setelah ini agar bisa menangkap DO group
      // yang id_so-nya berbeda dengan SO (kasus 1 DO group berisi 2 SO berbeda).
      // ─────────────────────────────────────────────────────────────────────────
      let data = await SoModel.findAll({
        attributes: {
          include: [[subqueryTotalQty, "total_qty"]],
        },
        where: obj,
        include: [
          KalkulasiInclude,
          {
            model: JoModel,
            as: "job_order",
            attributes: ["no_jo", "qty_lp", "qty_druk"],
            include: [
              {
                model: JobOrderMounting,
                as: "jo_mounting",
                where: { is_selected: true },
                required: false,
              },
            ],
          },
          {
            model: ProduksiLkhTahapan,
            as: "produksi_lkh_tahapan",
            attributes: ["id", "id_tahapan", "index"],
            separate: true,
            include: [
              {
                model: MasterTahapan,
                as: "tahapan",
              },
              {
                model: ProduksiLkhProses,
                as: "produksi_lkh_proses",
                attributes: [
                  "id",
                  "id_mesin",
                  "id_tahapan",
                  "id_operator",
                  "kode",
                  "deskripsi",
                  "proses",
                  "waktu_mulai",
                ],
                limit: 1,
                order: [["createdAt", "ASC"]],
                separate: true,
                include: [
                  { model: MasterMesinTahapan, as: "mesin" },
                  { model: Users, as: "operator" },
                ],
              },
            ],
          },
        ],
      });

      // ─── Konversi ke plain object ─────────────────────────────────────────────
      data = data.map((item) => item.toJSON());

      // ─── Fetch DO group manual per SO ─────────────────────────────────────────
      // Mencari DO group via delivery_order.id_so — bukan via delivery_order_group.id_so
      // sehingga DO group yang berisi item dari 2 SO berbeda tetap terbaca oleh keduanya.
      // total_qty per group dihitung hanya dari DO milik SO ini.
      //
      // Jika sort_by == "do", filter DO group berdasarkan rentang tgl_do.
      // ─────────────────────────────────────────────────────────────────────────
      const doGroupTglFilter =
        sort_by == "do"
          ? `AND dog.tgl_do BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}'`
          : "";

      data = await Promise.all(
        data.map(async (item) => {
          const doGroups = await db.query(
            `
            SELECT
              dog.id,
              dog.no_do,
              dog.tgl_do,
              COALESCE(SUM(do2.jumlah_qty), 0) AS total_qty
            FROM delivery_order_group dog
            JOIN delivery_order do2
              ON do2.id_do_group = dog.id
              AND do2.id_so = :id_so
              AND do2.is_active = 1
            WHERE dog.is_active = 1
              ${doGroupTglFilter}
            GROUP BY dog.id, dog.no_do, dog.tgl_do
            ORDER BY dog.tgl_do ASC
            `,
            {
              replacements: { id_so: item.id },
              type: db.QueryTypes.SELECT,
            },
          );

          item.delivery_order_group = doGroups;
          return item;
        }),
      );

      // ─── Post-filter ──────────────────────────────────────────────────────────
      if (status_po == "belum kirim") {
        data = data.filter(
          (item) =>
            !item.delivery_order_group ||
            item.delivery_order_group.length === 0,
        );
      } else if (status_po == "selesai") {
        data = data.filter((item) => {
          const totalKirim = parseFloat(item.total_qty) || 0;
          return totalKirim > 0 && totalKirim === item.po_qty;
        });
      } else if (status_po == "kurang qty") {
        data = data.filter((item) => {
          const totalKirim = parseFloat(item.total_qty) || 0;
          return totalKirim > 0 && totalKirim < item.po_qty;
        });
      } else if (status_po == "over qty") {
        data = data.filter((item) => {
          const totalKirim = parseFloat(item.total_qty) || 0;
          return totalKirim > item.po_qty;
        });
      }

      const dataRekap = hitungRekapan(data);
      const dataRekapPerBulan = hitungRekapanPerBulan(data, sort_by);

      return res.status(200).json({
        succes: true,
        status_code: 200,
        data_rekap: dataRekap,
        data_rekap_per_bulan: dataRekapPerBulan,
        data: data,
      });
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },
};

// ─── hitungRekapan ────────────────────────────────────────────────────────────
// ─── hitungRekapan ────────────────────────────────────────────────────────────
function hitungRekapan(data) {
  let otsQty = 0;
  let qtyTerkirim = 0;
  let ots = 0;
  let realisasi = 0;
  let qtyClose = 0;
  let omsetClose = 0;
  let totalQtyKeseluruhan = 0;
  let omset = 0;

  data.forEach((item) => {
    const poQty = item.po_qty || 0;
    const harga = item.harga_jual || 0;
    const doQty = parseFloat(item.total_qty) || 0;

    const qtySudahKirim = doQty;
    const qtyBelumKirim = Math.max(poQty - doQty, 0);

    totalQtyKeseluruhan += poQty;
    omset += poQty * harga;

    qtyTerkirim += qtySudahKirim;
    realisasi += qtySudahKirim * harga;

    if (item.status_work === "done") {
      qtyClose += qtyBelumKirim;
      omsetClose += qtyBelumKirim * harga;
    } else {
      otsQty += qtyBelumKirim;
      ots += qtyBelumKirim * harga;
    }
  });

  return {
    otsQty,
    qtyTerkirim,
    ots,
    realisasi,
    totalQtyKeseluruhan,
    omset,
    qtyClose,
    omsetClose,
  };
}

function hitungRekapanPerBulan(data, sort_by) {
  const rekapMap = {};

  data.forEach((item) => {
    const poQty = item.po_qty || 0;
    const harga = item.harga_jual || 0;
    const doQty = parseFloat(item.total_qty) || 0;

    const qtySudahKirim = doQty;
    const qtyBelumKirim = Math.max(poQty - doQty, 0);

    let tanggalAcuan;
    if (sort_by == "input so") {
      tanggalAcuan = item.createdAt;
    } else if (sort_by == "kirim so") {
      tanggalAcuan = item.tgl_pengiriman;
    } else if (sort_by == "do") {
      const dogs = item.delivery_order_group;
      tanggalAcuan = Array.isArray(dogs) ? dogs[0]?.tgl_do : null;
    }

    if (!tanggalAcuan) return;

    const date = new Date(tanggalAcuan);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!rekapMap[key]) {
      rekapMap[key] = {
        bulan: key,
        label: date.toLocaleString("id-ID", { month: "long", year: "numeric" }),
        otsQty: 0,
        qtyTerkirim: 0,
        ots: 0,
        realisasi: 0,
        totalQtyKeseluruhan: 0,
        omset: 0,
        qtyClose: 0,
        omsetClose: 0,
      };
    }

    rekapMap[key].totalQtyKeseluruhan += poQty;
    rekapMap[key].omset += poQty * harga;

    rekapMap[key].qtyTerkirim += qtySudahKirim;
    rekapMap[key].realisasi += qtySudahKirim * harga;

    if (item.status_work === "done") {
      rekapMap[key].qtyClose += qtyBelumKirim;
      rekapMap[key].omsetClose += qtyBelumKirim * harga;
    } else {
      rekapMap[key].otsQty += qtyBelumKirim;
      rekapMap[key].ots += qtyBelumKirim * harga;
    }
  });

  return Object.values(rekapMap).sort((a, b) => a.bulan.localeCompare(b.bulan));
}

module.exports = MonitoringSoController;
