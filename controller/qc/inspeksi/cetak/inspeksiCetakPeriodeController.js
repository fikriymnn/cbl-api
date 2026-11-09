const { Op, where } = require("sequelize");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const InspeksiCetakPeriodeDefectDepartment = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectDeparmentMOdel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const { createNcrQtyInspeksi } = require("../../ncr/service/ncrTicketService");

const inspeksiCetakPeriodeController = {
  doneCetakPeriode: async (req, res) => {
    const _id = req.params.id;
    const { catatan, sample_1, sample_2, sample_3 } = req.body;

    try {
      const noDoc = await MasterKodeDoc.findByPk(4);
      const inspeksiCetakPeriodePoint = await InspeksiCetakPeriodePoint.findAll(
        {
          where: { id_inspeksi_cetak_periode: _id },
        }
      );
      const jumlahPeriode = inspeksiCetakPeriodePoint.length;
      let totalWaktuCheck = inspeksiCetakPeriodePoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );

      await InspeksiCetakPeriode.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
          catatan: catatan,
          sample_1,
          sample_2,
          sample_3,
          hasil_sample_1: (sample_1 / 100) * 10000,
          hasil_sample_2: (sample_2 / 100) * 10000,
          hasil_sample_3: (sample_3 / 100) * 10000,
        },
        { where: { id: _id } }
      );
      const cetakPeriode = await InspeksiCetakPeriode.findByPk(_id);

      await InspeksiCetak.update(
        { status: "history", no_doc: noDoc.kode },
        { where: { id: cetakPeriode.id_inspeksi_cetak } }
      );

      const inspeksiCetak = await InspeksiCetak.findByPk(
        cetakPeriode.id_inspeksi_cetak
      );

      const pointDefectDepartment = await createNcrQtyInspeksi({
        proses: "cetak",
        DefectModel: InspeksiCetakPeriodeDefect,
        DepartmentModel: InspeksiCetakPeriodeDefectDepartment,
        kolomDepartment: "id_inspeksi_cetak_periode_point_defect",
        kolomDefect: "jumlah_defect",
        whereInspeksi: { id_inspeksi_cetak: cetakPeriode.id_inspeksi_cetak },
        whereDefect: { hasil: "not ok" },
        inspeksi: inspeksiCetak,
        idPelapor: req.user.id,
      });

      res
        .status(200)
        .json({ msg: "Done Successful", data: pointDefectDepartment });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingCetakPeriode: async (req, res) => {
    const _id = req.params.id;
    const { alasan_pending } = req.body;
    try {
      const cetakPeriode = await InspeksiCetakPeriode.findByPk(_id);
      // await InspeksiCetakPeriode.update(
      //   { status: "pending" },
      //   {
      //     where: { id: _id },
      //   }
      // );
      const inspeksiCetak = await InspeksiCetak.findByPk(
        cetakPeriode.id_inspeksi_cetak
      );
      await InspeksiCetak.update(
        {
          status: "pending",
          jumlah_pending: inspeksiCetak.jumlah_pending + 1,
          alasan_pending: alasan_pending,
        },
        {
          where: { id: cetakPeriode.id_inspeksi_cetak },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakPeriodeController;
