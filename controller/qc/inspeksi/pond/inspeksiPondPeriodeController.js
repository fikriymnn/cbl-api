const { Op, Sequelize, where } = require("sequelize");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");

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

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  pendingPondPeriode: async (req, res) => {
    const _id = req.params.id;
    try {
      const pondPeriode = await InspeksiPondPeriode.findByPk(_id);
      await InspeksiPondPeriode.update(
        { status: "pending" },
        {
          where: { id: _id },
        }
      );
      await InspeksiPond.update(
        { status: "pending" },
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
