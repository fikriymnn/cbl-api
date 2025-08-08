const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingSubAwal = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");
const InspeksiCoatingResultPointPeriodeDepartment = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingPeriodeDefectDeparmentMOdel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuaian = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");
const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");
const User = require("../../../../model/userModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const { Sequelize } = require("sequelize");

const inspeksiCoatingController = {
  updateInspeksiCoatingPeriode: async (req, res) => {
    try {
      const { catatan, sample_1, sample_2, sample_3 } = req.body;
      const { id } = req.params;
      let objSample = { s1: 0, s2: 0, s3: 0 };
      let objHasilSample = { hs1: 0, hs2: 0, hs3: 0 };

      if (sample_1) {
        (objSample.s1 = sample_1),
          (objHasilSample.hs1 = (sample_1 / 100) * 10000);
      }
      if (sample_2) {
        (objSample.s2 = sample_2),
          (objHasilSample.hs2 = (sample_2 / 100) * 10000);
      }
      if (sample_3) {
        (objSample.s3 = sample_3),
          (objHasilSample.hs3 = (sample_3 / 100) * 10000);
      }
      const noDoc = await MasterKodeDoc.findByPk(5);
      await InspeksiCoatingSubPeriode.update(
        {
          sample_1: objSample.s1,
          sample_2: objSample.s2,
          sample_3: objSample.s3,
          hasil_sample_1: objHasilSample.hs1,
          hasil_sample_2: objHasilSample.hs2,
          hasil_sample_3: objHasilSample.hs3,
          catatan,
          status: "history",
        },
        {
          where: {
            id_inspeksi_coating: id,
          },
        }
      );
      await InspeksiCoating.update(
        {
          status: "history",
          no_doc: noDoc.kode,
        },
        { where: { id } }
      );

      const inspeksiCoating = await InspeksiCoating.findByPk(id);

      const pointDefect = await InspeksiCoatingResultPointPeriode.findAll({
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
          id_inspeksi_coating: id,
          hasil: "not ok",
        },
      });

      let pointDefectDepartment = [];
      //console.log(pointDefect);
      for (let index = 0; index < pointDefect.length; index++) {
        const dataaa =
          await InspeksiCoatingResultPointPeriodeDepartment.findAll({
            where: {
              id_inspeksi_coating_periode_point_defect: pointDefect[index].id,
            },
          });
        //pointDefectDepartment.push(dataaa);
      }
      //console.log(pointDefectDepartment);

      for (let index = 0; index < pointDefect.length; index++) {
        //console.log(pointDefect[index].jumlah_defect);
        let defect = pointDefect[index].jumlah_defect;
        let pcs = inspeksiCoating.jumlah_pcs;
        let persen = (defect / pcs) * 100;
        let persen_kriteria = pointDefect[index].persen_kriteria;

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
            no_jo: inspeksiCoating.no_jo,
            no_io: inspeksiCoating.no_io,
            nama_produk: inspeksiCoating.nama_produk,
            department_pelapor: "QUALITY CONTROL",
            nama_pelapor: userQc.nama,
          });

          for (let ii = 0; ii < pointDefectDepartment[index].length; ii++) {
            const department = await NcrDepartment.create({
              id_ncr_tiket: data.id,
              id_department: pointDefectDepartment[index][ii].id_department,
              department: pointDefectDepartment[index][ii].nama_department,
            });
            await NcrKetidaksesuaian.create({
              id_department: department.id,
              ketidaksesuaian: `masalah pada proses cetak dengan kode ${pointDefect[index].kode} - ${pointDefect[index].masalah} dengan kriteria ${pointDefect[index].kriteria} di Proses Coating`,
            });
          }
        } else if (
          persen >= persen_kriteria &&
          pointDefect[index].sumber_masalah == "Mesin"
        ) {
          console.log("masuk os");
        }
      }

      return res.status(200).json({ data: "update successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
module.exports = inspeksiCoatingController;
