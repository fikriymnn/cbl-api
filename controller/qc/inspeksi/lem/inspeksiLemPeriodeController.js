const { Op, Sequelize, where } = require("sequelize");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");

const inspeksiLemPeriodeController = {
  doneLemPeriode: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;

    try {
      const inspeksiLemPeriodePoint = await InspeksiLemPeriodePoint.findAll({
        where: { id_inspeksi_lem_periode: _id },
      });
      const jumlahPeriode = inspeksiLemPeriodePoint.length;
      let totalWaktuCheck = inspeksiLemPeriodePoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiLemPeriode.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
          catatan: catatan,
        },
        { where: { id: _id } }
      );
      const lemPeriode = await InspeksiLemPeriode.findByPk(_id);

      await InspeksiLem.update(
        { status: "history" },
        { where: { id: lemPeriode.id_inspeksi_lem } }
      );

      const inspeksiLem = await InspeksiLem.findByPk(
        lemPeriode.id_inspeksi_lem
      );

      const pointDefect = await InspeksiLemPeriodeDefect.findAll({
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
          id_inspeksi_lem: lemPeriode.id_inspeksi_lem,
          hasil: "not ok",
        },
      });

      for (let index = 0; index < pointDefect.length; index++) {
        let defect = pointDefect[index].jumlah_defect;
        let pcs = inspeksiLem.jumlah_pcs;
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
        console.log(persen, persen_kriteria);
        if (
          persen >= persen_kriteria &&
          pointDefect[index].sumber_masalah != "mesin"
        ) {
          console.log("masuk ncr");
          const data = await NcrTicket.create({
            id_pelapor: req.user.id,
            tanggal: new Date(),
            kategori_laporan: pointDefect[index].sumber_masalah,
            no_jo: inspeksiLem.no_jo,
            no_io: inspeksiLem.no_io,
            qty_defect: pointDefect.jumlah_defect,
            nama_produk: inspeksiLem.nama_produk,
          });

          const department = await NcrDepartment.create({
            id_ncr_tiket: data.id,
            department: department_tujuan,
          });
          await NcrKetidaksesuain.create({
            id_department: department.id,
            ketidaksesuaian: `masalah pada proses lem dengan kode ${pointDefect[index].kode} - ${pointDefect[index].masalah} dengan kriteria ${pointDefect[index].kriteria}`,
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

  pendingLemPeriode: async (req, res) => {
    const _id = req.params.id;
    try {
      const lemPeriode = await InspeksiLemPeriode.findByPk(_id);
      await InspeksiLemPeriode.update(
        { status: "pending" },
        {
          where: { id: _id },
        }
      );

      const inspeksiLem = await InspeksiLem.findByPk(
        lemPeriode.id_inspeksi_lem
      );
      await InspeksiLem.update(
        { status: "pending", jumlah_pending: inspeksiLem.jumlah_pending + 1 },
        {
          where: { id: lemPeriode.id_inspeksi_lem },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemPeriodeController;
