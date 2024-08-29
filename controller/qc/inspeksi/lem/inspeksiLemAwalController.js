const { Op, Sequelize, where } = require("sequelize");
const InspeksiLem = require("../../../../model/qc/inspeksi/lem/inspeksiLemModel");
const InspeksiLemAwal = require("../../../../model/qc/inspeksi/lem/inspeksiLemAwalModel");
const InspeksiLemAwalPoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemAwalPointModel");
const User = require("../../../../model/userModel");
const InspeksiLemPeriode = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const InspeksiLemPeriodePoint = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const InspeksiLemPeriodeDefect = require("../../../../model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const MasterKodeMasalahLem = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahLemModel");

const inspeksiLemAwalController = {
  doneLemAwal: async (req, res) => {
    const _id = req.params.id;
    const { jenis_lem } = req.body;

    if (!jenis_lem)
      return res.status(400).json({ msg: "jenis lem wajib di isi" });

    try {
      const inspeksiLemAwalPoint = await InspeksiLemAwalPoint.findAll({
        where: { id_inspeksi_lem_awal: _id },
      });
      const jumlahPeriode = inspeksiLemAwalPoint.length;
      let totalWaktuCheck = inspeksiLemAwalPoint.reduce(
        (total, data) => total + data.lama_pengerjaan,
        0
      );
      await InspeksiLemAwal.update(
        {
          jumlah_periode: jumlahPeriode,
          waktu_check: totalWaktuCheck,
          status: "done",
        },
        { where: { id: _id } }
      );
      const lemAwal = await InspeksiLemAwal.findByPk(_id);
      await InspeksiLem.update(
        {
          jenis_lem: jenis_lem,
        },
        {
          where: {
            id: lemAwal.id_inspeksi_lem,
          },
        }
      );

      const masterKodelem = await MasterKodeMasalahLem.findAll({
        where: { status: "active" },
      });

      const lemPeriode = await InspeksiLemPeriode.create({
        id_inspeksi_lem: lemAwal.id_inspeksi_lem,
      });
      const lemPeriodePoint = await InspeksiLemPeriodePoint.create({
        id_inspeksi_lem_periode: lemPeriode.id,
      });
      for (let i = 0; i < masterKodelem.length; i++) {
        await InspeksiLemPeriodeDefect.create({
          id_inspeksi_lem_periode_point: lemPeriodePoint.id,
          id_inspeksi_lem: lemAwal.id_inspeksi_lem,
          kode: masterKodelem[i].kode,
          masalah: masterKodelem[i].masalah,
          kriteria: masterKodelem[i].kriteria,
          persen_kriteria: masterKodelem[i].persen_kriteria,
          sumber_masalah: masterKodelem[i].sumber_masalah,
        });
      }

      res.status(200).json({ msg: "Done Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  pendingLemAwal: async (req, res) => {
    const _id = req.params.id;
    try {
      const lemAwal = await InspeksiLemAwal.findByPk(_id);
      await InspeksiLemAwal.update(
        { status: "pending" },
        {
          where: { id: _id },
        }
      );
      await InspeksiLem.update(
        { status: "pending" },
        {
          where: { id: lemAwal.id_inspeksi_lem },
        }
      );
      res.status(200).json({ msg: "Pending Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiLemAwalController;
