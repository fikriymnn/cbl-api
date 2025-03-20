const { Op, Sequelize, where } = require("sequelize");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const InspeksiLemPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectDepartmentModel");
const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");
const User = require("../../../../model/userModel");

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
          "id",
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

      let pointDefectDepartment = [];

      for (let index = 0; index < pointDefect.length; index++) {
        const dataaa = await InspeksiLemPeriodeDefectDepartment.findAll({
          where: {
            id_inspeksi_lem_periode_point_defect: pointDefect[index].id,
          },
        });
        pointDefectDepartment.push(dataaa);
      }

      for (let index = 0; index < pointDefect.length; index++) {
        let defect = pointDefect[index].jumlah_defect;
        let pcs = inspeksiLem.jumlah_pcs;
        let persen = (defect / pcs) * 100;
        let persen_kriteria = pointDefect[index].persen_kriteria;
        let department = pointDefect[index].sumber_masalah;

        console.log(persen, persen_kriteria);
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
            no_jo: inspeksiLem.no_jo,
            no_io: inspeksiLem.no_io,
            qty_defect: pointDefect.jumlah_defect,
            nama_produk: inspeksiLem.nama_produk,
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
              ketidaksesuaian: `masalah pada proses cetak dengan kode ${pointDefect[index].kode} - ${pointDefect[index].masalah} dengan kriteria ${pointDefect[index].kriteria} di Proses Lem`,
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

  pendingLemPeriode: async (req, res) => {
    const _id = req.params.id;
    const { alasan_pending } = req.body;
    try {
      const lemPeriode = await InspeksiLemPeriode.findByPk(_id);
      // await InspeksiLemPeriode.update(
      //   { status: "pending" },
      //   {
      //     where: { id: _id },
      //   }
      // );

      const inspeksiLem = await InspeksiLem.findByPk(
        lemPeriode.id_inspeksi_lem
      );
      await InspeksiLem.update(
        {
          status: "pending",
          jumlah_pending: inspeksiLem.jumlah_pending + 1,
          alasan_pending: alasan_pending,
        },
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
