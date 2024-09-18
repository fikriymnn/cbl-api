const { Op, Sequelize, where } = require("sequelize");

const InspeksiRabutPoint = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const InspeksiRabutDefect = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");
const MasterKodeMasalahRabut = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahSamplingHasilRabutModel");
const User = require("../../../../model/userModel");

const inspeksiRabutpointController = {
  startRabutPoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiRabutPoint = await InspeksiRabutPoint.findByPk(_id);
      if (inspeksiRabutPoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiRabutPoint.update(
        {
          waktu_mulai: new Date(),
          id_inspektor: req.user.id,
          status: "on progress",
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Start Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  stopRabutPoint: async (req, res) => {
    const _id = req.params.id;
    const { catatan, lama_pengerjaan, qty_pallet, data_defect } = req.body;
    if (!qty_pallet)
      return res.status(400).json({ msg: "Qty Pallet Wajib di Isi" });

    if (!lama_pengerjaan || !data_defect || data_defect.length == 0)
      return res.status(400).json({ msg: "Incomplite Data" });
    try {
      for (let i = 0; i < data_defect.length; i++) {
        if (data_defect[i].hasil == null)
          return res.status(400).json({
            msg: `data defect dengan kode ${data_defect[i].kode} wajib di isi`,
          });
      }

      for (let index = 0; index < data_defect.length; index++) {
        await InspeksiRabutDefect.update(
          { hasil: data_defect[index].hasil },
          { where: { id: data_defect[index].id } }
        );
      }
      await InspeksiRabutPoint.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          lama_pengerjaan,
          catatan,
          qty_pallet,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Stop Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  createInspeksiRabutPoint: async (req, res) => {
    const { id_inspeksi_rabut } = req.body;
    try {
      //const masterKodepond = await MasterKodeMasalahRabut.findAll();

      const pondPeriodePoint = await InspeksiRabutPoint.create({
        id_inspeksi_rabut: id_inspeksi_rabut,
      });
      // for (let i = 0; i < masterKodepond.length; i++) {
      //   await InspeksiRabutDefect.create({
      //     id_inspeksi_rabut_point: pondPeriodePoint.id,
      //     kode: masterKodepond[i].kode,
      //     masalah: masterKodepond[i].masalah,
      //     id_inspeksi_rabut: id_inspeksi_rabut,
      //   });
      // }
      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  createInspeksiRabutPointDefect: async (req, res) => {
    const {
      id_inspeksi_rabut,
      id_inspeksi_rabut_point,
      id_defect,
      MasterDefect,
    } = req.body;

    try {
      // const MasterDefect = await MasterKodeMasalahRabut.findOne({
      //   where: { id: id_defect },
      // });

      await InspeksiRabutDefect.create({
        id_inspeksi_rabut_point: id_inspeksi_rabut_point,
        kode: MasterDefect.e_kode_produksi,
        masalah: MasterDefect.nama_kendala,
        kriteria: MasterDefect.criteria,
        persen_kriteria: MasterDefect.criteria_percent,
        sumber_masalah: MasterDefect.kategori_kendala,
        id_inspeksi_rabut: id_inspeksi_rabut,
      });

      // untuk department ketika data udah dari p1
      // for (let index = 0; index < MasterDefect.department.length; index++) {
      //   const element = array[index];

      // }

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiRabutpointController;
