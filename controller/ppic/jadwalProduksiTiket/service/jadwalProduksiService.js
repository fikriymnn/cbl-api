const db = require("../../../../config/database");
const { Op, Sequelize, where } = require("sequelize");
const JadwalKaryawan = require("../../../../model/hr/jadwalKaryawan/jadwalKaryawanModel");
const TiketJadwalProduksi = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiModel");
const TiketJadwalProduksiTahapan = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiTahapanModel");
const TiketJadwalProduksiPerJam = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiPerJamModel");
const TiketPerubahanTanggalKirim = require("../../../../model/ppic/jadwalProduksiCalculateModel/tiketPerubahanTanggalKirimModel");
const JadwalProduksi = require("../../../../model/ppic/jadwalProduksi/jadwalProduksiModel");
const masterShift = require("../../../../model/masterData/hr/masterShift/masterShiftModel");
const masterIstirahat = require("../../../../model/masterData/hr/masterShift/masterIstirahatModel");

const JadwalProduksiService = {
  creteJadwalProduksiService: async (
    item,
    no_jo,
    no_booking,
    no_po,
    no_io,
    customer,
    nama_bahan,
    tgl_kirim,
    tgl_so,
    tgl_cetak,
    qty_po,
    qty_pcs,
    qty_druk,
    qty_lp,
    tahap,
    id_jo,
    transaction = null
  ) => {
    const t = transaction || (await db.transaction());

    try {
      if (no_jo && no_booking) {
        let obj = {};
        if (item) obj.item = item;
        if (no_jo) obj.no_jo = no_jo;
        if (no_po) obj.no_po = no_po;
        if (no_io) obj.no_io = no_io;
        if (customer) obj.customer = customer;
        if (qty_po) obj.qty_po = qty_po;
        if (tgl_so) obj.tgl_so = tgl_so;
        if (nama_bahan) obj.nama_bahan = nama_bahan;
        if (qty_lp) obj.qty_lp = qty_lp;
        const checkBooking = await JadwalProduksi.findAll({
          where: { no_booking: no_booking },
        });

        if (checkBooking.length === 0)
          return res.status(404).json({
            status_code: 404,
            success: false,
            msg: "no booking tidak di temukan atau no booking belum di kalkulasi",
          });
        await JadwalProduksi.update(obj, {
          where: { no_booking: no_booking },
          transaction: t,
        });
        await TiketJadwalProduksi.update(
          { status_tiket: "history", no_jo: no_jo },
          { where: { no_booking: no_booking }, transaction: t }
        );
        if (!transaction) await t.commit();

        return {
          status_code: 200,
          success: true,
          message: "update booking with jo success",
        };
      } else if (no_jo) {
        const dataTiket = await TiketJadwalProduksi.create(
          {
            id_jo,
            item,
            no_jo,
            no_po,
            no_io,
            customer,
            nama_bahan,
            type: "jadwal",
            tgl_kirim,
            tgl_kirim_date: tgl_kirim,
            tgl_kirim_update: tgl_kirim,
            tgl_kirim_update_date: tgl_kirim,
            tgl_so,
            tgl_so_date: tgl_so,
            tgl_cetak,
            qty_po,
            qty_pcs,
            qty_druk,
            qty_lp,
          },
          { transaction: t }
        );
        let dataTahapan = [];
        for (let i = 0; i < tahap.length; i++) {
          const data = tahap[i];
          let fromData = "";
          const tahapanString = data.tahapan.toLowerCase();

          if (
            tahapanString.includes("potong") ||
            tahapanString.includes("plate") ||
            tahapanString.includes("sampling") ||
            tahapanString.includes("packing") ||
            tahapanString.includes("final inspection") ||
            tahapanString.includes("kirim")
          ) {
            fromData = "tgl";
          } else if (
            tahapanString.includes("lem") ||
            tahapanString.includes("lipat") ||
            tahapanString.includes("finishing")
          ) {
            fromData = "pcs";
          } else {
            fromData = "druk";
          }

          dataTahapan.push({
            id_tiket_jadwal_produksi: dataTiket.id,
            item: item,
            tahapan: data.tahapan,
            tahapan_ke: data.tahapan_ke,
            from: fromData,
            nama_kategori: data.nama_kategori,
            kategori: data.kategori,
            kategori_drying_time: data.kategori_drying_time,
            mesin: data.mesin,
            kapasitas_per_jam: data.kapasitas_per_jam,
            drying_time: data.drying_time,
            setting: data.setting,
            toleransi: data.toleransi,
          });
        }

        const findTahapFG = dataTahapan.find((data) => data.tahapan === "FG");

        if (!findTahapFG) {
          // Buat objek tahapan FG
          let tahapanFG = {
            id_tiket_jadwal_produksi: dataTiket.id,
            item: item,
            tahapan: "FG",
            tahapan_ke: 0,
            from: "tgl",
            nama_kategori: "",
            kategori: "",
            kategori_drying_time: "",
            mesin: "",
            kapasitas_per_jam: 0,
            drying_time: 0,
            setting: 0,
            toleransi: 0,
          };

          // Tentukan posisi kedua terakhir (sebelum "Kirim")
          let insertIndex = dataTahapan.length - 1;

          // Sisipkan tahapan FG pada posisi kedua terakhir
          dataTahapan.splice(insertIndex, 0, tahapanFG);

          // Perbarui tahapan_ke secara otomatis
          dataTahapan.forEach((item, index) => {
            item.tahapan_ke = index + 1;
          });
        }

        await TiketJadwalProduksiTahapan.bulkCreate(dataTahapan, {
          transaction: t,
        });
        if (!transaction) await t.commit();

        return {
          status_code: 200,
          success: true,
          message: "create jadwal success",
        };
      } else if (no_booking) {
        const dataTiket = await TiketJadwalProduksi.create(
          {
            item,
            no_booking,
            no_po,
            no_io,
            customer,
            nama_bahan,
            type: "booking",
            tgl_kirim,
            tgl_kirim_date: tgl_kirim,
            tgl_kirim_update: tgl_kirim,
            tgl_kirim_update_date: tgl_kirim,
            tgl_so,
            tgl_so_date: tgl_so,
            tgl_cetak,
            qty_po,
            qty_pcs,
            qty_druk,
            qty_lp,
          },
          { transaction: t }
        );
        let dataTahapan = [];
        for (let i = 0; i < tahap.length; i++) {
          const data = tahap[i];
          let fromData = "";
          const tahapanString = data.tahapan.toLowerCase();

          if (
            tahapanString.includes("potong") ||
            tahapanString.includes("plate") ||
            tahapanString.includes("sampling") ||
            tahapanString.includes("packing") ||
            tahapanString.includes("final inspection") ||
            tahapanString.includes("kirim")
          ) {
            fromData = "tgl";
          } else if (
            tahapanString.includes("lem") ||
            tahapanString.includes("lipat") ||
            tahapanString.includes("finishing")
          ) {
            fromData = "pcs";
          } else {
            fromData = "druk";
          }

          dataTahapan.push({
            id_tiket_jadwal_produksi: dataTiket.id,
            item: item,
            tahapan: data.tahapan,
            tahapan_ke: data.tahapan_ke,
            from: fromData,
            nama_kategori: data.nama_kategori,
            kategori: data.kategori,
            kategori_drying_time: data.kategori_drying_time,
            mesin: data.mesin,
            kapasitas_per_jam: data.kapasitas_per_jam,
            drying_time: data.drying_time,
            setting: data.setting,
            toleransi: data.toleransi,
          });
        }

        const findTahapFG = dataTahapan.find((data) => data.tahapan === "FG");
        const indexFinalInspection = dataTahapan.findIndex((data) =>
          data.tahapan.toLowerCase().includes("final inspection")
        );

        if (!findTahapFG && indexFinalInspection !== -1) {
          // Buat objek tahapan FG
          let tahapanFG = {
            id_tiket_jadwal_produksi: dataTiket.id,
            item: item,
            tahapan: "FG",
            tahapan_ke: 0,
            from: "tgl",
            nama_kategori: "",
            kategori: "",
            kategori_drying_time: "",
            mesin: "",
            kapasitas_per_jam: 0,
            drying_time: 0,
            setting: 0,
            toleransi: 0,
          };

          // Jika ditemukan, sisipkan FG setelahnya
          const insertIndex = indexFinalInspection + 1;

          dataTahapan.splice(insertIndex, 0, tahapanFG);

          // Perbarui tahapan_ke
          dataTahapan.forEach((item, index) => {
            item.tahapan_ke = index + 1;
          });
        }

        await TiketJadwalProduksiTahapan.bulkCreate(dataTahapan, {
          transaction: t,
        });
        if (!transaction) await t.commit();

        return {
          status_code: 200,
          success: true,
          message: "create booking success",
        };
      } else {
        return {
          status_code: 404,
          success: false,
          message: "tidak ada no_jo atau no_booking",
        };
      }
    } catch (error) {
      if (!transaction) await t.rollback();
      throw { success: false, message: error.message };
    }
  },
};

module.exports = JadwalProduksiService;
