const { Op, Sequelize, where } = require("sequelize");
const ProduksiLkhTahapan = require("../../model/produksi/produksiLkhTahapanModel");
const ProduksiLkhProses = require("../../model/produksi/produksiLkhProsesModel");
const MasterKodeProduksi = require("../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterKategoriKendala = require("../../model/masterData/kodeProduksi/masterKategoriKendalaModel");
const MasterTahapan = require("../../model/masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../../model/masterData/tahapan/masterMesinTahapanModel");
const MasterKriteriaKendala = require("../../model/masterData/kodeProduksi/masterKriteriaKendalaModel");
const ProduksiLkh = require("../../model/produksi/produksiLkhModel");
const ioMountingModel = require("../../model/marketing/io/ioMountingModel");
const IoTahapan = require("../../model/marketing/io/ioTahapanModel");
const MasterTahapanMesin = require("../../model/masterData/tahapan/masterTahapanMesinModel");
const SoModel = require("../../model/marketing/so/soModel");
const JobOrder = require("../../model/ppic/jobOrder/jobOrderModel");
const JobOrderMounting = require("../../model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("../../model/ppic/jobOrder/joUserActionModel");
const Users = require("../../model/userModel");
const db = require("../../config/database");
const soModel = require("../../model/marketing/so/soModel");
const masterShift = require("../../model/masterData/hr/masterShift/masterShiftModel");
const {
  creteTicketMtcOs2Service,
} = require("../mtc/ticketMaintenance/ticketMaintenanceService");
const InspeksiPotongService = require("../qc/inspeksi/potong/service/inspeksiPotongService");
const InspeksiCetakService = require("../qc/inspeksi/cetak/service/inspeksiCetakService");

const ProduksiLkhProsesController = {
  getProduksiLkhProses: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      id_produksi_lkh,
      id_produksi_lkh_tahapan,
      id_tahapan,
      id_mesin,
      id_operator,
      search,
      is_approved_svp,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { kode_produksi: { [Op.like]: `%${search}%` } },
          { deskripsi_kode: { [Op.like]: `%${search}%` } },
          { baik: { [Op.like]: `%${search}%` } },
          { rusak_sebagian: { [Op.like]: `%${search}%` } },
          { rusak_total: { [Op.like]: `%${search}%` } },
          { pallet: { [Op.like]: `%${search}%` } },
        ],
      };
    }
    if (status) obj.status = status;
    if (id_produksi_lkh) obj.id_produksi_lkh = id_produksi_lkh;
    if (id_produksi_lkh_tahapan)
      obj.id_produksi_lkh_tahapan = id_produksi_lkh_tahapan;
    if (id_tahapan) obj.id_tahapan = id_tahapan;
    if (id_mesin) obj.id_mesin = id_mesin;
    if (id_operator) obj.id_operator = id_operator;
    if (is_approved_svp) obj.status = "request to spv";

    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tgl_pembuatan_bom = { [Op.between]: [startDate, endDate] };
    }
    try {
      if (page && limit) {
        const length = await ProduksiLkhProses.count({ where: obj });
        const data = await ProduksiLkhProses.findAll({
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_lkh",
            },
            {
              model: Users,
              as: "operator",
            },
          ],
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await ProduksiLkhProses.findByPk(_id, {
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_lkh",
            },
            {
              model: Users,
              as: "operator",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await ProduksiLkhProses.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: ProduksiLkh,
              as: "produksi_lkh",
            },
            {
              model: Users,
              as: "operator",
            },
          ],
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  startProduksiLkhProses: async (req, res) => {
    const { id_jo, id_tahapan, id_mesin, id_operator, id_kode_produksi } =
      req.body;
    const t = await db.transaction();

    try {
      const checkJo = await JobOrder.findByPk(id_jo, {
        include: [
          {
            model: JobOrderMounting,
            as: "jo_mounting",
            where: { is_active: true },
            required: false,
          },
        ],
      });

      const checkIoMounting = await ioMountingModel.findByPk(
        checkJo.jo_mounting[0].id_io_mounting
      );
      const checkProduksiLkh = await ProduksiLkh.findOne({
        where: {
          id_jo: id_jo,
          id_tahapan: id_tahapan,
          id_mesin: id_mesin,
          id_operator: id_operator,
        },
        include: [
          {
            model: MasterTahapan,
            as: "tahapan",
          },
        ],
      });

      // Ambil shift untuk semua hari
      const checkShifts = await masterShift.findAll();
      const shiftInfo = getCurrentShiftInfo(checkShifts);

      if (!checkProduksiLkh) {
        const dataProduksiLkhTahapan = await ProduksiLkhTahapan.findOne({
          where: {
            id_jo: id_jo,
            id_tahapan: id_tahapan,
            is_active: true,
          },
          include: [
            {
              model: MasterTahapan,
              as: "tahapan",
            },
          ],
        });

        const checkMasterMesin = await MasterMesinTahapan.findByPk(id_mesin);
        handleTahapan({
          tahapan: dataProduksiLkhTahapan.tahapan.nama_tahapan,
          shift: shiftInfo.shift,
          periode_tiket: shiftInfo.periodDate,
          no_jo: checkJo.no_jo,
          operator: req.user.name,
          mesin: checkMasterMesin.nama_mesin,
          customer: dataProduksiLkhTahapan.customer,
          jam: shiftInfo.currentTime,
          no_io: dataProduksiLkhTahapan.no_io,
          produk: dataProduksiLkhTahapan.produk,
          qty_jo: checkJo.QTY,
          status_jo: checkJo.status_jo,
          tanggal_pembuatan: shiftInfo.periodDateFormatted,
          jenis_gramatur: checkIoMounting.gramature_kertas,
          jenis_kertas: checkIoMounting.nama_kertas,
          warna_depan: checkIoMounting.keterangan_warna_depan,
          warna_belakang: checkIoMounting.keterangan_warna_belakang,
          qty_druk: checkJo.qty_druk,
          mata: null,
          merk: null,
          transaction: t,
        });

        const dataProduksiLkh = await ProduksiLkh.create(
          {
            id_produksi_lkh_tahapan: dataProduksiLkhTahapan.id,
            id_jo: dataProduksiLkhTahapan.id_jo,
            id_io: dataProduksiLkhTahapan.id_io,
            id_so: dataProduksiLkhTahapan.id_so,
            id_customer: dataProduksiLkhTahapan.id_customer,
            id_produk: dataProduksiLkhTahapan.id_produk,
            id_tahapan: dataProduksiLkhTahapan.id_tahapan,
            id_mesin: id_mesin,
            id_operator: id_operator,
            no_jo: dataProduksiLkhTahapan.no_jo,
            no_io: dataProduksiLkhTahapan.no_io,
            no_so: dataProduksiLkhTahapan.no_so,
            customer: dataProduksiLkhTahapan.customer,
            produk: dataProduksiLkhTahapan.produk,
            tgl_kirim: dataProduksiLkhTahapan.tgl_kirim,
            qty_jo: dataProduksiLkhTahapan.qty_jo,
            spesifikasi: dataProduksiLkhTahapan.spesifikasi,
          },
          { transaction: t }
        );

        //crete lkh prosess
        const dataKodeProduksi = await MasterKodeProduksi.findByPk(
          id_kode_produksi,
          {
            include: [
              {
                model: MasterKategoriKendala,
                as: "kategori_kendala",
              },
              {
                model: MasterKriteriaKendala,
                as: "kriteria_qty_mtc",
              },
              {
                model: MasterKriteriaKendala,
                as: "kriteria_waktu_mtc",
              },
              {
                model: MasterKriteriaKendala,
                as: "kriteria_frekuensi_mtc",
              },
            ],
          }
        );

        await ProduksiLkhProses.create(
          {
            id_jo: id_jo,
            id_produksi_lkh: dataProduksiLkh.id,
            id_produksi_lkh_tahapan: dataProduksiLkhTahapan.id,
            id_tahapan: dataProduksiLkhTahapan.id_tahapan,
            id_mesin: id_mesin,
            id_operator: id_operator,
            id_kode_produksi: id_kode_produksi,
            kode: dataKodeProduksi.kode,
            deskripsi: dataKodeProduksi.deskripsi,
            proses: dataKodeProduksi.proses_produksi,
            waktu_mulai: new Date(),
          },
          { transaction: t }
        );

        if (
          dataKodeProduksi.kategori_kendala != null &&
          dataKodeProduksi.kategori_kendala.kategori
            .toLowerCase()
            .includes("mesin")
        ) {
          const dataMesin = await MasterMesinTahapan.findByPk(id_mesin);
          const dataUser = await Users.findByPk(id_operator);
          //kirim tiket ke mtc
          await creteTicketMtcOs2Service(
            dataKodeProduksi.kode, //kode produksi
            dataProduksiLkhTahapan.id_jo, //id jo
            dataProduksiLkhTahapan.no_jo, // no jo
            dataProduksiLkhTahapan.produk, // nama produk
            dataProduksiLkhTahapan.no_io, // no io
            dataProduksiLkhTahapan.no_so, // no so
            dataProduksiLkhTahapan.customer, //  nama customer
            dataProduksiLkhTahapan.qty_jo, //qty jo
            dataProduksiLkhTahapan.qty_druk, //qty druk belum di buat
            dataProduksiLkhTahapan.spesifikasi, //spesifikasi
            dataProduksiLkhTahapan.tahapan.nama_tahapan, //nama proses/tahapan
            dataMesin.nama_mesin, //nama mesin
            "ini bagian", //masih belum di buat
            dataUser.nama, //nama operator
            new Date(), //tanggal
            dataKodeProduksi.kategori_kendala.kategori, //kategori kendala
            dataKodeProduksi.id, //id kode produksi
            dataKodeProduksi.deskripsi, // nama kendala
            "unit", // unit => belum tau dimana ngambilnya
            "0", //bagian => belum tau dimana ngambilnya
            dataKodeProduksi.kriteria_frekuensi_mtc?.value || 999, //maksimal kedatangan tiket
            "Month", //periode kedatangan tiket => belum tau ngambil dari mana, dengan default perbulan
            dataKodeProduksi.kriteria_waktu_mtc?.value | 999, //maksimal waktu pengerjaan
            dataKodeProduksi.target_department, //target department
            t //transaction
          );
        }

        await t.commit();
        res.status(200).json({
          succes: true,
          status_code: 200,
          msg: "Start Successfully",
        });
      } else {
        //create lkh proses
        const dataKodeProduksi = await MasterKodeProduksi.findByPk(
          id_kode_produksi,
          {
            include: [
              {
                model: MasterKategoriKendala,
                as: "kategori_kendala",
              },
              {
                model: MasterKriteriaKendala,
                as: "kriteria_qty_mtc",
              },
              {
                model: MasterKriteriaKendala,
                as: "kriteria_waktu_mtc",
              },
              {
                model: MasterKriteriaKendala,
                as: "kriteria_frekuensi_mtc",
              },
            ],
          }
        );

        console.log(checkProduksiLkh.tahapan.nama_tahapan);
        const checkMasterMesin = await MasterMesinTahapan.findByPk(id_mesin);
        handleTahapan({
          tahapan: checkProduksiLkh.tahapan.nama_tahapan,
          shift: shiftInfo.shift,
          periode_tiket: shiftInfo.periodDate,
          no_jo: checkJo.no_jo,
          operator: req.user.name,
          mesin: checkMasterMesin.nama_mesin,
          customer: checkProduksiLkh.customer,
          jam: shiftInfo.currentTime,
          no_io: checkProduksiLkh.no_io,
          produk: checkProduksiLkh.produk,
          qty_jo: checkJo.qty,
          status_jo: checkJo.status_jo,
          tanggal_pembuatan: shiftInfo.periodDateFormatted,
          jenis_gramatur: checkIoMounting.gramature_kertas,
          jenis_kertas: checkIoMounting.nama_kertas,
          warna_depan: checkIoMounting.keterangan_warna_depan,
          warna_belakang: checkIoMounting.keterangan_warna_belakang,
          qty_druk: checkJo.qty_druk,
          mata: null,
          merk: null,
          transaction: t,
        });

        await ProduksiLkhProses.create(
          {
            id_jo: id_jo,
            id_produksi_lkh: checkProduksiLkh.id,
            id_produksi_lkh_tahapan: checkProduksiLkh.id_produksi_lkh_tahapan,
            id_tahapan: checkProduksiLkh.id_tahapan,
            id_mesin: id_mesin,
            id_operator: id_operator,
            id_kode_produksi: id_kode_produksi,
            kode: dataKodeProduksi.kode,
            deskripsi: dataKodeProduksi.deskripsi,
            proses: dataKodeProduksi.proses_produksi,
            waktu_mulai: new Date(),
          },
          { transaction: t }
        );

        if (
          dataKodeProduksi.kategori_kendala != null &&
          dataKodeProduksi.kategori_kendala.kategori
            .toLowerCase()
            .includes("mesin")
        ) {
          const dataMesin = await MasterMesinTahapan.findByPk(id_mesin);
          const dataUser = await Users.findByPk(id_operator);
          //kirim tiket ke mtc
          await creteTicketMtcOs2Service(
            dataKodeProduksi.kode, //kode produksi
            checkProduksiLkh.id_jo, //id jo
            checkProduksiLkh.no_jo, // no jo
            checkProduksiLkh.produk, // nama produk
            checkProduksiLkh.no_io, // no io
            checkProduksiLkh.no_so, // no so
            checkProduksiLkh.customer, //  nama customer
            checkProduksiLkh.qty_jo, //qty jo
            checkProduksiLkh.qty_druk, //qty druk belum di buat
            checkProduksiLkh.spesifikasi, //spesifikasi
            checkProduksiLkh.tahapan.nama_tahapan, //nama proses/tahapan
            dataMesin.nama_mesin, //nama mesin
            "ini bagian", //masih belum di buat
            dataUser.nama, //nama operator
            new Date(), //tanggal
            dataKodeProduksi.kategori_kendala.kategori, //kategori kendala
            dataKodeProduksi.id, //id kode produksi
            dataKodeProduksi.deskripsi, // nama kendala
            "unit", // unit => belum tau dimana ngambilnya
            "0", //bagian => belum tau dimana ngambilnya
            dataKodeProduksi.kriteria_frekuensi_mtc?.value || 999, //maksimal kedatangan tiket
            "Month", //periode kedatangan tiket => belum tau ngambil dari mana, dengan default perbulan
            dataKodeProduksi.kriteria_waktu_mtc?.value | 999, //maksimal waktu pengerjaan
            dataKodeProduksi.target_department, //target department
            t //transaction
          );
          console.log("create mtc tiket");
        }

        await t.commit();
        res.status(200).json({
          succes: true,
          status_code: 200,
          msg: "Start Successfully",
        });
      }
    } catch (error) {
      await t.rollback();
      console.log(error);
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  stopProduksiLkhProses: async (req, res) => {
    const _id = req.params.id;
    const { baik, rusak_sebagian, rusak_total, pallet, note } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await ProduksiLkhProses.findByPk(_id, {});
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      const start = new Date(checkData.waktu_mulai);
      const end = new Date();

      // hasil dalam detik
      const totalDetik = Math.floor((end - start) / 1000);
      let obj = {};

      await ProduksiLkhProses.update(
        {
          baik: baik,
          rusak_sebagian: rusak_sebagian,
          rusak_total: rusak_total,
          pallet: pallet,
          note: note,
          waktu_selesai: new Date(),
          total_waktu: totalDetik,
          status: "done",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Stop Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  approveSpvProduksiLkhProses: async (req, res) => {
    const _id = req.params.id;
    const { produksi_lkh_proses } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await ProduksiLkhProses.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      const checkDataLkh = await ProduksiLkh.findByPk(
        checkData.id_produksi_lkh
      );
      const checkDataLkhtahapan = await ProduksiLkhTahapan.findByPk(
        checkData.id_produksi_lkh_tahapan
      );

      if (!checkDataLkhtahapan)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data lkh tidak ditemukan",
        });

      for (let i = 0; i < produksi_lkh_proses.length; i++) {
        const e = produksi_lkh_proses[i];
        await ProduksiLkhProses.update(
          {
            baik: e.baik,
            rusak_sebagian: e.rusak_sebagian,
            rusak_total: e.rusak_total,
            pallet: e.pallet,
          },
          {
            where: { id: e.id },
            transaction: t,
          }
        );
      }

      //doone untuk tahapan yg di action
      await ProduksiLkhTahapan.update(
        { status: "done" },
        { where: { id: checkDataLkhtahapan.id }, transaction: t }
      );

      //get data tahapan selnjutnya
      const checkDataLkhtahapanNext = await ProduksiLkhTahapan.findOne({
        where: {
          id_jo: checkDataLkhtahapan.id_jo,
          index: checkDataLkhtahapan.index + 1,
          is_active: true,
        },
      });

      if (checkDataLkhtahapanNext) {
        await ProduksiLkhTahapan.update(
          { status: "active" },
          { where: { id: checkDataLkhtahapanNext.id }, transaction: t }
        );
      }
      await ProduksiLkhProses.update(
        { status: "done" },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

function getCurrentShiftInfo(shiftData) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // dalam menit
  const currentDay = now.getDay(); // 0 = Minggu, 1 = Senin, dst

  // Mapping hari
  const dayNames = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  let dayName = dayNames[currentDay];

  // Cari data shift untuk hari ini
  let todayShift = shiftData.find((s) => s.hari === dayName);

  // Jika tidak ada (Minggu), gunakan data Libur
  if (!todayShift) {
    todayShift = shiftData.find((s) => s.hari === "Libur");
  }

  // Parse waktu shift
  const shift1Start = parseTime(todayShift.shift_1_masuk);
  const shift1End = parseTime(todayShift.shift_1_keluar);
  const shift2Start = parseTime(todayShift.shift_2_masuk);
  const shift2End = parseTime(todayShift.shift_2_keluar);

  let shiftNumber = null;
  let periodDate = new Date(now);

  // Logika penentuan shift dengan inklusi waktu di luar shift
  if (currentTime >= shift1Start && currentTime < shift2Start) {
    // Shift 1: dari 08:00 sampai sebelum 20:00
    // Termasuk waktu 16:00-20:00 yang awalnya di luar shift
    shiftNumber = 1;
  } else if (currentTime >= shift2Start) {
    // Shift 2 dimulai (20:00 ke atas sampai 23:59)
    shiftNumber = 2;
  } else if (currentTime < shift2End) {
    // Shift 2 masih berlanjut dari hari sebelumnya (00:00 - 04:00)
    shiftNumber = 2;
    // Periode tanggal mundur 1 hari
    periodDate.setDate(periodDate.getDate() - 1);
  } else {
    // Waktu antara shift2End dan shift1Start (04:00 - 08:00)
    // Masukkan ke shift 2 periode kemarin
    shiftNumber = 2;
    periodDate.setDate(periodDate.getDate() - 1);
  }

  return {
    shift: shiftNumber,
    periodDate: periodDate.toISOString().split("T")[0], // Format YYYY-MM-DD
    periodDateFormatted: formatDate(periodDate),
    currentTime: `${String(currentHour).padStart(2, "0")}:${String(
      currentMinute
    ).padStart(2, "0")}`,
    dayName: dayName,
  };
}

// Helper function untuk parse waktu HH:MM:SS ke menit
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper function untuk format tanggal
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

async function handleTahapan({
  tahapan,
  shift,
  periode_tiket,
  operator,
  mesin,
  tanggal_pembuatan,
  no_io,
  no_jo,
  jam,
  produk,
  merk,
  customer,
  status_jo,
  qty_jo,
  qty_druk,
  mata,
  jenis_kertas,
  jenis_gramatur,
  warna_depan,
  warna_belakang,
  transaction,
}) {
  // Normalisasi input menjadi lowercase untuk pencocokan yang lebih fleksibel
  const tahapanLower = tahapan.toLowerCase();

  // Cek setiap tahapan berdasarkan kata kunci
  if (tahapanLower.includes("potong")) {
    console.log("Menjalankan proses pemotongan...");
    // Logika untuk tahap potong
    let jenis_potong = null;
    if (tahapanLower == "potong") {
      jenis_potong = "potong bahan";
    } else if (tahapanLower == "potong jadi") {
      jenis_potong = "potong jadi";
    }
    if (jenis_potong != null) {
      const checkDataPotong =
        await InspeksiPotongService.getInspeksiPotongService({
          jenis_potong: jenis_potong,
          shift: shift,
          periode_tiket: periode_tiket,
          no_jo: no_jo,
          operator: operator,
          mesin: mesin,
        });
      if (checkDataPotong.data.length == 0) {
        const createInspeksiPotong =
          await InspeksiPotongService.creteInspeksiPotongService({
            tahapan: tahapan,
            tanggal: tanggal_pembuatan,
            periode_tiket: periode_tiket,
            no_io: no_io,
            no_jo: no_jo,
            operator: operator,
            shift: shift,
            jam: jam,
            item: produk,
            mesin: mesin,
            merk: merk,
            customer: customer,
            status_jo: status_jo,
            qty_jo: qty_jo,
            transaction: transaction,
          });

        if (createInspeksiPotong.success === false) {
          if (!transaction) await transaction.rollback();

          return res.status(400).json(createInspeksiPotong);
        }
      }
    }
    return {
      tahap: "potong",
      action: "proses_potong",
    };
  } else if (tahapanLower.includes("cetak")) {
    console.log("Menjalankan proses pencetakan...");
    // Logika untuk tahap cetak

    console.log(
      tahapan,
      shift,
      periode_tiket,
      operator,
      mesin,
      tanggal_pembuatan,
      no_io,
      no_jo,
      jam,
      produk,
      merk,
      customer,
      status_jo,
      qty_jo,
      qty_druk,
      mata,
      jenis_kertas,
      jenis_gramatur,
      warna_depan,
      warna_belakang
    );
    const checkDataCetak = await InspeksiCetakService.getInspeksiCetakService({
      tahapan: tahapan,
      shift: shift,
      periode_tiket: periode_tiket,
      no_jo: no_jo,
      operator: operator,
      mesin: mesin,
    });

    if (checkDataCetak.data.length == 0) {
      const createInspeksiCetak =
        await InspeksiCetakService.creteInspeksiCetakService({
          tahapan: tahapan,
          tanggal: tanggal_pembuatan,
          periode_tiket: periode_tiket,
          no_io: no_io,
          no_jo: no_jo,
          operator: operator,
          shift: shift,
          jam: jam,
          nama_produk: produk,
          mesin: mesin,
          merk: merk,
          customer: customer,
          status_jo: status_jo,
          qty_jo: qty_jo,
          jumlah_pcs: qty_jo,
          jumlah_druk: qty_druk,
          mata: mata,
          jenis_kertas: jenis_kertas,
          jenis_gramatur: jenis_gramatur,
          warna_depan: warna_depan,
          warna_belakang: warna_belakang,
          transaction: transaction,
        });

      if (createInspeksiCetak.success === false) {
        if (!transaction) await transaction.rollback();

        return res.status(400).json(createInspeksiCetak);
      }
    }

    return {
      tahap: "cetak",
      action: "proses_cetak",
    };
  } else if (tahapanLower.includes("coating")) {
    console.log("Menjalankan proses coating...");
    // Logika untuk tahap coating
    return {
      tahap: "coating",
      action: "proses_coating",
    };
  } else if (tahapanLower.includes("pond")) {
    console.log("Menjalankan proses pond...");
    // Logika untuk tahap pond
    return {
      tahap: "pond",
      action: "proses_pond",
    };
  } else if (tahapanLower.includes("lem")) {
    console.log("Menjalankan proses pelemanan...");
    // Logika untuk tahap lem
    return {
      tahap: "lem",
      action: "proses_lem",
    };
  } else if (tahapanLower.includes("rabut")) {
    console.log("Menjalankan proses rabut...");
    // Logika untuk tahap rabut
    return {
      tahap: "rabut",
      action: "proses_rabut",
    };
  } else if (tahapanLower.includes("sortir")) {
    console.log("Menjalankan proses sortir...");
    // Logika untuk tahap sortir
    return {
      tahap: "sortir",
      action: "proses_sortir",
    };
  } else if (tahapanLower.includes("lipat")) {
    console.log("Menjalankan proses lipat...");
    // Logika untuk tahap lipat
    return {
      tahap: "lipat",
      action: "proses_lipat",
    };
  } else {
    console.log("Tahapan tidak dikenali");
    return {
      tahap: "unknown",
      action: "tidak_ada_aksi",
    };
  }
}

module.exports = ProduksiLkhProsesController;
