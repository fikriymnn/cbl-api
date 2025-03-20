const { Op, Sequelize, where } = require("sequelize");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const InspeksiPondPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectDepartmentModel");
const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");
const User = require("../../../../model/userModel");

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
          "id",
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

      let pointDefectDepartment = [];

      for (let index = 0; index < pointDefect.length; index++) {
        const dataaa = await InspeksiPondPeriodeDefectDepartment.findAll({
          where: {
            id_inspeksi_pond_periode_point_defect: pointDefect[index].id,
          },
        });
        pointDefectDepartment.push(dataaa);
      }

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
        //console.log(persen, persen_kriteria);
        if (
          persen >= persen_kriteria &&
          pointDefect[index].sumber_masalah != "Mesin"
        ) {
          console.log("masuk ncr");
          const userQc = await User.findByPk(req.user.id);
          const data = await NcrTicket.create({
            id_pelapor: req.user.id,
            tanggal: new Date(),
            kategori_laporan: pointDefect[index].sumber_masalah,
            no_jo: inspeksiPond.no_jo,
            no_io: inspeksiPond.no_io,
            qty_defect: pointDefect.jumlah_defect,
            nama_produk: inspeksiPond.nama_produk,
            department_pelapor: "QUALITY CONTROL",
            nama_pelapor: userQc.nama,
          });

          for (let ii = 0; ii < pointDefectDepartment[index].length; ii++) {
            const department = await NcrDepartment.create({
              id_ncr_tiket: data.id,
              id_department: pointDefectDepartment[index][ii].id_department,
              department: pointDefectDepartment[index][ii].nama_department,
            });
            await NcrKetidaksesuain.create({
              id_department: department.id,
              ketidaksesuaian: `masalah pada proses cetak dengan kode ${pointDefect[index].kode} - ${pointDefect[index].masalah} dengan kriteria ${pointDefect[index].kriteria} di Proses Pond`,
            });
          }
        } else if (
          persen >= persen_kriteria &&
          pointDefect[index].sumber_masalah == "Mesin"
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
    const { alasan_pending } = req.body;
    try {
      const pondPeriode = await InspeksiPondPeriode.findByPk(_id);
      // await InspeksiPondPeriode.update(
      //   { status: "pending" },
      //   {
      //     where: { id: _id },
      //   }
      // );
      const inspeksipond = await InspeksiPond.findByPk(
        pondPeriode.id_inspeksi_pond
      );
      await InspeksiPond.update(
        {
          status: "pending",
          jumlah_pending: inspeksipond.jumlah_pending + 1,
          alasan_pending: alasan_pending,
        },
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
