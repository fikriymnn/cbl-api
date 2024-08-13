const { Op, Sequelize, where } = require("sequelize");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");

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

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemPeriodeController;
