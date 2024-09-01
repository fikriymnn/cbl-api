const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");
const InspeksiCoatingSubAwal = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");
const NcrDepartment = require("../../../../model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuaian = require("../../../../model/qc/ncr/ncrKetidaksesuaianModel");
const NcrTicket = require("../../../../model/qc/ncr/ncrTicketModel");

const inspeksiCoatingController = {
   updateInspeksiCoatingPeriode: async (req, res) => {
      try {
         const { catatan,point } = req.body
         const { id } = req.params
         await InspeksiCoatingSubPeriode.update({
            catatan, status: "history"
         }, {
            where: {
               id_inspeksi_coating: id
            }
         })
         await InspeksiCoating.update({
            status:"history"
         },{where: {id}})

         const inspeksiCoating = await InspeksiCoating.findByPk(id);
    
          const pointDefect = await InspeksiCoatingResultPointPeriode.findAll({
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
              id_inspeksi_coating: id,
              hasil: "not ok",
            },
          });
    
          for (let index = 0; index < pointDefect.length; index++) {
            let defect = pointDefect[index].jumlah_defect;
            let pcs = inspeksiCoating.jumlah_pcs;
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
                no_jo: inspeksiCoating.no_jo,
                no_io: inspeksiCoating.no_io,
                nama_produk: inspeksiCoating.nama_produk,
              });
    
              const department = await NcrDepartment.create({
                id_ncr_tiket: data.id,
                department: department_tujuan,
              });
              await NcrKetidaksesuaian.create({
                id_department: department.id,
                ketidaksesuaian: `masalah pada proses cetak dengan kode ${pointDefect[index].kode} - ${pointDefect[index].masalah} dengan kriteria ${pointDefect[index].kriteria}`,
              });
            } else if (
              persen >= persen_kriteria &&
              pointDefect[index].sumber_masalah == "mesin"
            ){
               console.log("masuk os");
             }
           }
         

         return res.status(200).json({ data:"update successfully", msg: "OK" });
      } catch (err) {
         res.status(500).json({ msg: err.message })
      }
   },
}
module.exports = inspeksiCoatingController 