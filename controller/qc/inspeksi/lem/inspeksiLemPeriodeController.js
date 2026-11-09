const { Op, where } = require("sequelize");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const InspeksiLemPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectDepartmentModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const { createNcrQtyInspeksi } = require("../../ncr/service/ncrTicketService");

const inspeksiLemPeriodeController = {
  doneLemPeriode: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;

    try {
      const noDoc = await MasterKodeDoc.findByPk(7);
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
        { status: "history", no_doc: noDoc.kode },
        { where: { id: lemPeriode.id_inspeksi_lem } }
      );

      const inspeksiLem = await InspeksiLem.findByPk(
        lemPeriode.id_inspeksi_lem
      );

      await createNcrQtyInspeksi({
        proses: "lem",
        DefectModel: InspeksiLemPeriodeDefect,
        DepartmentModel: InspeksiLemPeriodeDefectDepartment,
        kolomDepartment: "id_inspeksi_lem_periode_point_defect",
        kolomDefect: "jumlah_defect",
        whereInspeksi: { id_inspeksi_lem: lemPeriode.id_inspeksi_lem },
        whereDefect: { hasil: "not ok" },
        inspeksi: inspeksiLem,
        idPelapor: req.user.id,
      });

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
