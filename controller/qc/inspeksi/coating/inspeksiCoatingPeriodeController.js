const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");
const InspeksiCoatingSubAwal = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");

const inspeksiCoatingController = {
   updateInspeksiCoatingPeriode: async (req, res) => {
      try {
         const { catatan } = req.body
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

         return res.status(200).json({ data:"update successfully", msg: "OK" });
      } catch (err) {
         res.status(500).json({ msg: err.message })
      }
   },
}
module.exports = inspeksiCoatingController 