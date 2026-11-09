const { Op, where } = require("sequelize");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const InspeksiPondPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectDepartmentModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const { createNcrQtyInspeksi } = require("../../ncr/service/ncrTicketService");

const inspeksiPondPeriodeController = {
  donePondPeriode: async (req, res) => {
    const _id = req.params.id;
    const { catatan } = req.body;

    try {
      const noDoc = await MasterKodeDoc.findByPk(6);
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
        { status: "history", no_doc: noDoc.kode },
        { where: { id: pondPeriode.id_inspeksi_pond } }
      );

      const inspeksiPond = await InspeksiPond.findByPk(
        pondPeriode.id_inspeksi_pond
      );

      await createNcrQtyInspeksi({
        proses: "pond",
        DefectModel: InspeksiPondPeriodeDefect,
        DepartmentModel: InspeksiPondPeriodeDefectDepartment,
        kolomDepartment: "id_inspeksi_pond_periode_point_defect",
        kolomDefect: "jumlah_defect",
        whereInspeksi: { id_inspeksi_pond: pondPeriode.id_inspeksi_pond },
        whereDefect: { hasil: "not ok" },
        inspeksi: inspeksiPond,
        idPelapor: req.user.id,
      });

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
