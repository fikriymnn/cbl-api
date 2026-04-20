const { Op, Sequelize, where } = require("sequelize");
const BookingJadwal = require("../../../model/ppic/bookingJadwal/bookingJadwalModel");
const JadwalProduksi = require("../../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const KapasitasMesin = require("../../../model/ppic/kapasitasMesin/kapsitasMesinModel");
const MasterMesin = require("../../../model/masterData/tahapan/masterMesinTahapanModel");
const db = require("../../../config/database");

const ReportKapasitasController = {
  getReportKapasitas: async (req, res) => {
    const { tahun, bulan } = req.query;
    try {
      if (!tahun || !bulan)
        return res.status(400).json({ msg: "tahun dan bulan wajib" });

      const startDate = new Date(tahun, bulan - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      // ✅ Akhir bulan yang dipilih saja
      const endDate = new Date(tahun, bulan, 0); // hari terakhir bulan
      endDate.setHours(23, 59, 59, 999);

      const dataJoTerjadwal = await JadwalProduksi.findAll({
        where: { tanggal: { [Op.between]: [startDate, endDate] } },
      });

      const dataMesin = await MasterMesin.findAll({
        include: [
          {
            model: KapasitasMesin,
            as: "kapasitas_mesin",
            required: true,
            where: { tahun: tahun },
          },
        ],
      });

      const bulanMap = {
        1: "jan",
        2: "feb",
        3: "mar",
        4: "apr",
        5: "mei",
        6: "jun",
        7: "jul",
        8: "ags",
        9: "sep",
        10: "okt",
        11: "nov",
        12: "des",
      };

      const bulanInt = parseInt(bulan);
      const tahunInt = parseInt(tahun);
      const fieldBulan = bulanMap[bulanInt];
      const bulanKey = `${fieldBulan}_${tahunInt}`;

      const detailPerMesin = {};
      const pemakaianPerMesin = {};

      for (const row of dataJoTerjadwal) {
        const noJo = row.no_jo;
        const noBooking = row.no_booking;

        let identifier, jenis;
        if (noJo) {
          identifier = `jo_${noJo}`;
          jenis = "produksi";
        } else if (noBooking) {
          identifier = `booking_${noBooking}`;
          jenis = "booking";
        } else {
          continue;
        }

        const mesinKey = row.mesin;

        if (!detailPerMesin[mesinKey]) detailPerMesin[mesinKey] = {};
        if (!detailPerMesin[mesinKey][bulanKey]) {
          detailPerMesin[mesinKey][bulanKey] = { seen: new Set(), rows: [] };
        }

        if (!detailPerMesin[mesinKey][bulanKey].seen.has(identifier)) {
          detailPerMesin[mesinKey][bulanKey].seen.add(identifier);

          const mesinData = dataMesin.find(
            (m) => m.kode_mesin === mesinKey || m.nama_mesin === mesinKey
          );
          const typeKapasitas = mesinData ? mesinData.type_kapasitas : "";

          let qty = 0;
          if (typeKapasitas === "pcs") qty = row.qty_pcs || 0;
          else if (typeKapasitas === "druk") qty = row.qty_druk || 0;
          else if (typeKapasitas === "lp") qty = row.qty_lp || 0;
          else qty = row.qty_druk || 0;

          detailPerMesin[mesinKey][bulanKey].rows.push({
            id: row.id,
            no_jo: row.no_jo,
            no_booking: row.no_booking,
            item: row.item,
            tahapan: row.tahapan,
            mesin: row.mesin,
            tanggal: row.tanggal,
            jam: row.jam,
            qty_pcs: row.qty_pcs,
            qty_druk: row.qty_druk,
            qty_dipakai: qty,
            jenis,
          });

          if (!pemakaianPerMesin[mesinKey]) pemakaianPerMesin[mesinKey] = {};
          pemakaianPerMesin[mesinKey][bulanKey] =
            (pemakaianPerMesin[mesinKey][bulanKey] || 0) + qty;
        }
      }

      const result = dataMesin.map((mesin) => {
        const mesinKey = mesin.kode_mesin;
        const kapasitasData = mesin.kapasitas_mesin.find(
          (k) => k.tahun === tahunInt
        );

        const kapasitasNilai = kapasitasData?.[fieldBulan] || 0;

        const pemakaian =
          pemakaianPerMesin[mesinKey] ||
          pemakaianPerMesin[mesin.nama_mesin] ||
          {};
        const detailMesin =
          detailPerMesin[mesinKey] || detailPerMesin[mesin.nama_mesin] || {};

        const terpakai = pemakaian[bulanKey] || 0;

        return {
          id: mesin.id,
          kode_mesin: mesin.kode_mesin,
          nama_mesin: mesin.nama_mesin,
          type_kapasitas: mesin.type_kapasitas,
          bulan: bulanInt,
          tahun: tahunInt,
          label: fieldBulan,
          kapasitas: kapasitasNilai,
          terpakai,
          sisa: kapasitasNilai - terpakai,
          detail: detailMesin[bulanKey]?.rows || [],
        };
      });

      return res.status(200).json({
        list_kapasitas: dataMesin.map((mesin) => {
          const kapasitasData = mesin.kapasitas_mesin.find(
            (k) => k.tahun === tahunInt
          );
          return {
            id: mesin.id,
            kode_mesin: mesin.kode_mesin,
            nama_mesin: mesin.nama_mesin,
            type_kapasitas: mesin.type_kapasitas,
            kapasitas: kapasitasData?.[fieldBulan] || 0,
          };
        }),
        sisa_kapasitas: result,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

const listKapasitasMesin = [
  {
    mesin: "R700",
    kapasitas: 900000,
    proses: "cetak",
  },
  {
    mesin: "SM",
    kapasitas: 600000,
    proses: "cetak",
  },
  {
    mesin: "GTO",
    kapasitas: 350000,
    proses: "cetak",
  },
  {
    mesin: "HOCK",
    kapasitas: 1500000,
    proses: "coating",
  },
  {
    mesin: "MANUAL",
    kapasitas: 500000,
    proses: "coating",
  },
  {
    mesin: "BOARDER",
    kapasitas: 1400000,
    proses: "pond",
  },
  {
    mesin: "KSB",
    kapasitas: 300000,
    proses: "pond",
  },
  {
    mesin: "JK1000",
    kapasitas: 2500000,
    proses: "lem",
  },
  {
    mesin: "JK650",
    kapasitas: 4000000,
    proses: "lem",
  },
  {
    mesin: "LIPAT",
    kapasitas: 2000000,
    proses: "lipat",
  },
];

module.exports = ReportKapasitasController;
