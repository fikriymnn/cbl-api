const { Op, Sequelize, where } = require("sequelize");

const InspeksiRabutPoint = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const InspeksiRabutDefect = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutDefectModel");
const InspeksiRabutDefectDepartment = require("../../../../model/qc/inspeksi/rabut/inspeksiRabutPeriodeDefectDepartmentModel");
const MasterKodeMasalahRabut = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahSamplingHasilRabutModel");
const User = require("../../../../model/userModel");
const db = require("../../../../config/database");

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
    const { catatan, lama_pengerjaan, qty_pallet, eye_c, data_defect } =
      req.body;
    if (!qty_pallet)
      return res.status(400).json({ msg: "Qty Pallet Wajib di Isi" });

    if (!lama_pengerjaan)
      return res.status(400).json({ msg: "Incomplite Data" });
    try {
      if (data_defect.length > 0) {
        for (let i = 0; i < data_defect.length; i++) {
          if (data_defect[i].hasil == null)
            return res.status(400).json({
              msg: `data defect dengan kode ${data_defect[i].kode} wajib di isi`,
            });
        }
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
          eye_c,
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
      kode_lkh,
      masalah_lkh,
      mesin,
      operator,
    } = req.body;
    //console.log(req.body);
    const t = await db.transaction();

    try {
      // const MasterDefect = await MasterKodeMasalahRabut.findOne({
      //   where: { id: id_defect },
      // });

      const rabutDefect = await InspeksiRabutDefect.create(
        {
          id_inspeksi_rabut_point: id_inspeksi_rabut_point,
          kode: MasterDefect.e_kode_produksi,
          masalah: MasterDefect.nama_kendala,
          kode_lkh: kode_lkh,
          masalah_lkh: masalah_lkh,
          kriteria: MasterDefect.criteria,
          persen_kriteria: MasterDefect.criteria_percent,
          sumber_masalah: MasterDefect.kategori_kendala,
          id_inspeksi_rabut: id_inspeksi_rabut,
          mesin,
          operator,
        },
        { transaction: t }
      );

      // untuk department ketika data udah dari p1
      for (let ii = 0; ii < MasterDefect.target_department.length; ii++) {
        const depart = MasterDefect.target_department[ii];
        await InspeksiRabutDefectDepartment.create(
          {
            id_inspeksi_rabut_periode_point_defect: rabutDefect.id,
            id_department: parseInt(depart.id_department),
            nama_department: depart.nama_department,
          },
          { transaction: t }
        );
      }
      // for (let index = 0; index < MasterDefect.department.length; index++) {
      //   const element = array[index];

      // }
      await t.commit();
      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({ msg: error.message });
    }
  },

  istirahatRabutPoint: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiRabutPoint.update(
        {
          waktu_istirahat: new Date(),
          status: "istirahat",
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Istirahat Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
  istirahatMasukRabutPoint: async (req, res) => {
    const _id = req.params.id;
    const { lama_istirahat } = req.body;
    try {
      await InspeksiRabutPoint.update(
        {
          waktu_masuk_istirahat: new Date(),
          lama_istirahat: lama_istirahat,
          status: "on progress",
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Istirahat Masuk Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiRabutpointController;
