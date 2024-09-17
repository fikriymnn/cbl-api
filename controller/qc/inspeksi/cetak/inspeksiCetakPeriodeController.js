const { Op, Sequelize, where } = require("sequelize");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");

const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");

const inspeksiCetakPeriodeController = {
  doneCetakPeriode: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;

    try {
      const inspeksiCetakPeriodePoint = await InspeksiCetakPeriodePoint.findAll(
        {
          where: { id_inspeksi_cetak_periode: _id },
        }
      );
      const jumlahPeriode = inspeksiCetakPeriodePoint.length;
      let totalWaktuCheck = inspeksiCetakPeriodePoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiCetakPeriode.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
          catatan: catatan,
        },
        { where: { id: _id } }
      );
      const cetakPeriode = await InspeksiCetakPeriode.findByPk(_id);

      await InspeksiCetak.update(
        { status: "history" },
        { where: { id: cetakPeriode.id_inspeksi_cetak } }
      );

      const inspeksiCetak = await InspeksiCetak.findByPk(
        cetakPeriode.id_inspeksi_cetak
      );

      const pointDefect = await InspeksiCetakPeriodeDefect.findAll({
        attributes: [
          [
            Sequelize.fn("SUM", Sequelize.col("jumlah_defect")),
            "jumlah_defect",
          ],

          "kode",
          "sumber_masalah",
          "persen_kriteria",
          "kriteria",
          "masalah",
        ],
        group: ["kode"],
        where: {
          id_inspeksi_cetak: cetakPeriode.id_inspeksi_cetak,
          hasil: "not ok",
        },
      });

      for (let index = 0; index < pointDefect.length; index++) {
        let defect = pointDefect[index].jumlah_defect;
        let pcs = inspeksiCetak.jumlah_pcs;
        let persen = (defect / pcs) * 100;
        let persen_kriteria = pointDefect[index].persen_kriteria;
        let department = pointDefect[index].sumber_masalah;
        let department_tujuan = "";
        if (department == "man") {
          department_tujuan = "hrd";
        } else if (department == "material") {
          department_tujuan = "purchasing";
        } else if (department == "persiapan") {
          department_tujuan = "persiapan";
        }
        if (
          persen >= persen_kriteria &&
          pointDefect[index].sumber_masalah != "mesin"
        ) {
          console.log("masuk ncr");
          const data = await NcrTicket.create({
            id_pelapor: req.user.id,
            tanggal: new Date(),
            kategori_laporan: pointDefect[index].sumber_masalah,
            no_jo: inspeksiCetak.no_jo,
            no_io: inspeksiCetak.no_io,
            qty_defect: pointDefect.jumlah_defect,
            nama_produk: inspeksiCetak.nama_produk,
          });

          const department = await NcrDepartment.create({
            id_ncr_tiket: data.id,
            department: department_tujuan,
          });
          await NcrKetidaksesuain.create({
            id_department: department.id,
            ketidaksesuaian: `masalah pada proses cetak dengan kode ${pointDefect[index].kode} - ${pointDefect[index].masalah} dengan kriteria ${pointDefect[index].kriteria}`,
          });
        } else if (
          persen >= persen_kriteria &&
          pointDefect[index].sumber_masalah == "mesin"
        ) {
          console.log("masuk os");
        }
      }

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingCetakPeriode: async (req, res) => {
    const _id = req.params.id;
    try {
      const cetakPeriode = await InspeksiCetakPeriode.findByPk(_id);
      // await InspeksiCetakPeriode.update(
      //   { status: "pending" },
      //   {
      //     where: { id: _id },
      //   }
      // );
      const inspeksiCetak = await InspeksiCetak.findByPk(
        cetakPeriode.id_inspeksi_cetak
      );
      await InspeksiCetak.update(
        { status: "pending", jumlah_pending: inspeksiCetak.jumlah_pending + 1 },
        {
          where: { id: cetakPeriode.id_inspeksi_cetak },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakPeriodeController;
