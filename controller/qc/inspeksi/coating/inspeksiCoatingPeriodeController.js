const InspeksiCoating = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingModel");
const InspeksiCoatingResultAwal = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const InspeksiCoatingResultPeriode = require("../../../../model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const InspeksiCoatingResultPointPeriode = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const InspeksiCoatingSubAwal = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const InspeksiCoatingSubPeriode = require("../../../../model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");
const InspeksiCoatingResultPointPeriodeDepartment = require("../../../../model/qc/inspeksi/coating/inspeksiCoatingPeriodeDefectDeparmentMOdel");
const { createNcrQtyInspeksi } = require("../../ncr/service/ncrTicketService");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");

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

      await createNcrQtyInspeksi({
        proses: "coating",
        DefectModel: InspeksiCoatingResultPointPeriode,
        DepartmentModel: InspeksiCoatingResultPointPeriodeDepartment,
        kolomDepartment: "id_inspeksi_coating_periode_point_defect",
        kolomDefect: "jumlah_defect",
        whereInspeksi: { id_inspeksi_coating: id },
        whereDefect: { hasil: "not ok" },
        inspeksi: inspeksiCoating,
        idPelapor: req.user.id,
      });

      return res.status(200).json({ data: "update successfully", msg: "OK" });
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
module.exports = inspeksiCoatingController;
