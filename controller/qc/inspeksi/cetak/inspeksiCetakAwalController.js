const { Op, Sequelize, where } = require("sequelize");
const InspeksiCetak = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakModel");
const InspeksiCetakAwal = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const InspeksiCetakAwalPoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const User = require("../../../../model/userModel");
const InspeksiCetakPeriode = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const InspeksiCetakPeriodePoint = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const InspeksiCetakPeriodeDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const MasterKodeMasalahCetak = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCetakModel");

const inspeksiCetakAwalController = {
  doneCetakAwal: async (req, res) => {
    const _id = req.params.id;

    try {
      const inspeksiCetakAwalPoint = await InspeksiCetakAwalPoint.findAll({
        where: { id_inspeksi_cetak_awal: _id },
      });
      const jumlahPeriode = inspeksiCetakAwalPoint.length;
      let totalWaktuCheck = inspeksiCetakAwalPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiCetakAwal.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
        },
        { where: { id: _id } }
      );
      const cetakAwal = await InspeksiCetakAwal.findByPk(_id);
      console.log(cetakAwal);

      const masterKodeCetak = await MasterKodeMasalahCetak.findAll({
        where: { status: "active" },
      });

      const cetakPeriode = await InspeksiCetakPeriode.create({
        id_inspeksi_cetak: cetakAwal.id_inspeksi_cetak,
      });
      const cetakPeriodePoint = await InspeksiCetakPeriodePoint.create({
        id_inspeksi_cetak_periode: cetakPeriode.id,
      });
      for (let i = 0; i < masterKodeCetak.length; i++) {
        await InspeksiCetakPeriodeDefect.create({
          id_inspeksi_cetak_periode_point: cetakPeriodePoint.id,
          kode: masterKodeCetak[i].kode,
          masalah: masterKodeCetak[i].masalah,
        });
      }

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiCetakAwalController;
