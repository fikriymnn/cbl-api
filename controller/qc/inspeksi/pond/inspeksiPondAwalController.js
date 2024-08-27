const { Op, Sequelize, where } = require("sequelize");
const InspeksiPond = require("../../../../model/qc/inspeksi/pond/inspeksiPondModel");
const InspeksiPondAwal = require("../../../../model/qc/inspeksi/pond/inspeksiPondAwalModel");
const InspeksiPondAwalPoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondAwalPointModel");
const User = require("../../../../model/userModel");
const InspeksiPondPeriode = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const InspeksiPondPeriodePoint = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const InspeksiPondPeriodeDefect = require("../../../../model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const MasterKodeMasalahpond = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahPondModel");

const inspeksiPondAwalController = {
  donePondAwal: async (req, res) => {
    const _id = req.params.id;

    try {
      const inspeksiPondAwalPoint = await InspeksiPondAwalPoint.findAll({
        where: { id_inspeksi_pond_awal: _id },
      });
      const jumlahPeriode = inspeksiPondAwalPoint.length;
      let totalWaktuCheck = inspeksiPondAwalPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiPondAwal.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
        },
        { where: { id: _id } }
      );
      const pondAwal = await InspeksiPondAwal.findByPk(_id);
      console.log(pondAwal);

      const masterKodepond = await MasterKodeMasalahpond.findAll({
        where: { status: "active" },
      });

      const pondPeriode = await InspeksiPondPeriode.create({
        id_inspeksi_pond: pondAwal.id_inspeksi_pond,
      });
      const pondPeriodePoint = await InspeksiPondPeriodePoint.create({
        id_inspeksi_pond_periode: pondPeriode.id,
      });
      for (let i = 0; i < masterKodepond.length; i++) {
        await InspeksiPondPeriodeDefect.create({
          id_inspeksi_pond_periode_point: pondPeriodePoint.id,
          id_inspeksi_pond: pondAwal.id_inspeksi_pond,
          kode: masterKodepond[i].kode,
          masalah: masterKodepond[i].masalah,
          kriteria: masterKodepond[i].kriteria,
          persen_kriteria: masterKodepond[i].persen_kriteria,
          sumber_masalah: masterKodepond[i].sumber_masalah,
        });
      }

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  pendingPondAwal: async (req, res) => {
    const _id = req.params.id;
    try {
      const pondAwal = await InspeksiPondAwal.findByPk(_id);
      await InspeksiPondAwal.update(
        { status: "pending" },
        {
          where: { id: _id },
        }
      );
      await InspeksiPond.update(
        { status: "pending" },
        {
          where: { id: pondAwal.id_inspeksi_pond },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiPondAwalController;
