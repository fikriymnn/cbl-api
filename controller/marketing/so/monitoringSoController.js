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

const MonitoringSoController = {
  getSoMonitoring: async (req, res) => {
    const { start_date, end_date, id_customer, sort_by, status_po } = req.query;

    try {
      let obj = { status: "history" };
      let objDo = {};

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

      const DoInclude = {
        model: DeliveriOrderGrupModel,
        as: "delivery_order_group",
        attributes: [
          "id",
          "tgl_do",
          "no_do",
          [
            fn("SUM", col("delivery_order_group->delivery_order.jumlah_qty")),
            "total_qty",
          ],
        ],
        include: [
          {
            model: DeliveriOrderModel,
            as: "delivery_order",
            attributes: [],
          },
        ],
        duplicating: false,
      };

      // Filter sort_by
      if (sort_by == "input so") {
        obj.createdAt = { [Op.between]: [startDate, endDate] };
      } else if (sort_by == "kirim so") {
        obj.tgl_pengiriman = { [Op.between]: [startDate, endDate] };
      } else if (sort_by == "do") {
        objDo.tgl_do = { [Op.between]: [startDate, endDate] };
        DoInclude.where = objDo;
        DoInclude.required = true;
      } else {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "sort by tidak ada dalam pilihan yang disediakan",
        });
      }

      // Filter status_po
      if (status_po == "semua") {
        // tidak ada filter tambahan
      } else if (status_po == "close") {
        obj.status_work = "done";
      } else if (status_po == "cancel") {
        obj.status = "cancel";
      } else if (status_po == "belum kirim") {
        DoInclude.required = false;
        obj["$delivery_order_group.id$"] = { [Op.is]: null };
      } else if (status_po == "selesai") {
        DoInclude.required = true;
      } else if (status_po == "kurang qty") {
        DoInclude.required = true;
      } else if (status_po == "over qty") {
        DoInclude.required = true;
      } else {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "status po tidak ada dalam pilihan yang disediakan",
        });
      }

      if (id_customer) obj.id_customer = id_customer;

      let data = await SoModel.findAll({
        where: obj,
        include: [
          DoInclude,
          {
            model: JoModel,
            as: "job_order",
            attributes: ["no_jo", "qty_lp", "qty_druk"],
            include: [
              {
                model: JobOrderMounting,
                as: "jo_mounting",
                where: { is_selected: true },
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
                order: [["createdAt", "ASC"]], // paling lama
                separate: true, // WAJIB supaya limit bekerja
                include: [
                  { model: MasterMesinTahapan, as: "mesin" },
                  {
                    model: Users,
                    as: "operator",
                  },
                ],
              },
            ],
          },
        ],
        group: ["so.id", "delivery_order_group.id"],
      });

      // Post-filter untuk selesai, kurang qty, over qty
      if (status_po == "selesai") {
        data = data.filter((item) => {
          const dg = item.delivery_order_group;
          return dg && parseInt(dg.dataValues.total_qty) === item.po_qty;
        });
      } else if (status_po == "kurang qty") {
        data = data.filter((item) => {
          const dg = item.delivery_order_group;
          return dg && parseInt(dg.dataValues.total_qty) < item.po_qty;
        });
      } else if (status_po == "over qty") {
        data = data.filter((item) => {
          const dg = item.delivery_order_group;
          return dg && parseInt(dg.dataValues.total_qty) > item.po_qty;
        });
      }

      const dataRekap = await hitungRekapan(data);
      // ✅ Tambahan rekap per bulan
      const dataRekapPerBulan = hitungRekapanPerBulan(data, sort_by);

      return res.status(200).json({
        succes: true,
        status_code: 200,
        data_rekap: dataRekap,
        data_rekap_per_bulan: dataRekapPerBulan, // ✅
        data: data,
      });
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },
};

function hitungRekapan(data) {
  let otsQty = 0;
  let qtyTerkirim = 0;
  let ots = 0;
  let realisasi = 0;

  data.forEach((item) => {
    const poQty = item.po_qty || 0;
    const harga = item.harga_jual || 0;
    const doQty =
      parseInt(item.delivery_order_group?.dataValues?.total_qty) || 0;

    const qtySudahKirim = doQty;
    const qtyBelumKirim = Math.max(poQty - doQty, 0);

    qtyTerkirim += qtySudahKirim;
    otsQty += qtyBelumKirim;

    realisasi += qtySudahKirim * harga;
    ots += qtyBelumKirim * harga;
  });

  const totalQtyKeseluruhan = otsQty + qtyTerkirim;
  const omset = ots + realisasi;

  return {
    otsQty,
    qtyTerkirim,
    ots,
    realisasi,
    totalQtyKeseluruhan,
    omset,
  };
}

// ✅ Fungsi rekap per bulan
function hitungRekapanPerBulan(data, sort_by) {
  const rekapMap = {};

  data.forEach((item) => {
    const poQty = item.po_qty || 0;
    const harga = item.harga_jual || 0;
    const doQty =
      parseInt(item.delivery_order_group?.dataValues?.total_qty) || 0;

    // Tentukan tanggal acuan berdasarkan sort_by
    let tanggalAcuan;
    if (sort_by == "input so") {
      tanggalAcuan = item.createdAt;
    } else if (sort_by == "kirim so") {
      tanggalAcuan = item.tgl_pengiriman;
    } else if (sort_by == "do") {
      tanggalAcuan = item.delivery_order_group?.dataValues?.tgl_do;
    }

    if (!tanggalAcuan) return; // skip jika tanggal tidak ada

    const date = new Date(tanggalAcuan);
    // Key format: "YYYY-MM" untuk sorting yang mudah
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
      };
    }

    const qtySudahKirim = doQty;
    const qtyBelumKirim = Math.max(poQty - doQty, 0);

    rekapMap[key].qtyTerkirim += qtySudahKirim;
    rekapMap[key].otsQty += qtyBelumKirim;
    rekapMap[key].realisasi += qtySudahKirim * harga;
    rekapMap[key].ots += qtyBelumKirim * harga;
  });

  // Hitung total dan urutkan berdasarkan bulan (ascending)
  const result = Object.values(rekapMap)
    .map((item) => ({
      ...item,
      totalQtyKeseluruhan: item.otsQty + item.qtyTerkirim,
      omset: item.ots + item.realisasi,
    }))
    .sort((a, b) => a.bulan.localeCompare(b.bulan));

  return result;
}

module.exports = MonitoringSoController;
