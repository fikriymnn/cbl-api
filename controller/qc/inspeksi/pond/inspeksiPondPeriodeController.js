const { Op, Sequelize, where } = require("sequelize");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");

const inspeksiPondPeriodeController = {
  donePondPeriode: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;

    try {
      const inspeksiPondPeriodePoint = await InspeksiPondPeriodePoint.findAll({
        where: { id_inspeksi_pond_periode: _id },
      });
      const jumlahPeriode = inspeksiPondPeriodePoint.length;
      let totalWaktuCheck = inspeksiPondPeriodePoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiPondPeriode.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
          catatan: catatan,
        },
        { where: { id: _id } }
      );
      const pondPeriode = await InspeksiPondPeriode.findByPk(_id);

      await InspeksiPond.update(
        { status: "history" },
        { where: { id: pondPeriode.id_inspeksi_pond } }
      );

      const inspeksiPond = await InspeksiPond.findByPk(
        pondPeriode.id_inspeksi_pond
      );

      const pointDefect = await InspeksiPondPeriodeDefect.findAll({
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
          id_inspeksi_pond: pondPeriode.id_inspeksi_pond,
          hasil: "not ok",
        },
      });

      for (let index = 0; index < pointDefect.length; index++) {
        let defect = pointDefect[index].jumlah_defect;
        let pcs = inspeksiPond.jumlah_pcs;
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
            no_jo: inspeksiPond.no_jo,
            no_io: inspeksiPond.no_io,
            qty_defect: pointDefect.jumlah_defect,
            nama_produk: inspeksiPond.nama_produk,
          });

          const department = await NcrDepartment.create({
            id_ncr_tiket: data.id,
            department: department_tujuan,
          });
          await NcrKetidaksesuain.create({
            id_department: department.id,
            ketidaksesuaian: `masalah pada proses pond dengan kode ${pointDefect[index].kode} - ${pointDefect[index].masalah} dengan kriteria ${pointDefect[index].kriteria}`,
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
  pendingPondPeriode: async (req, res) => {
    const _id = req.params.id;
    try {
      const pondPeriode = await InspeksiPondPeriode.findByPk(_id);
      await InspeksiPondPeriode.update(
        { status: "pending" },
        {
          where: { id: _id },
        }
      );
      const inspeksipond = await InspeksiPond.findByPk(
        pondPeriode.id_inspeksi_pond
      );
      await InspeksiPond.update(
        { status: "pending", jumlah_pending: inspeksipond.jumlah_pending + 1 },
        {
          where: { id: pondPeriode.id_inspeksi_pond },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiPondPeriodeController;
