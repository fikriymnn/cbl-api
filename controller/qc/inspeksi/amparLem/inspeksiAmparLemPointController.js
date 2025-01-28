const { Op, Sequelize, where } = require("sequelize");

const InspeksiAmparLemPoint = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPointModel");
const InspeksiAmparLemDefect = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemDefectModel");
const InspeksiAmparLemDefectDepartment = require("../../../../model/qc/inspeksi/amparLem/inspeksiAmparLemPeriodeDefectDepartmentModel");
const User = require("../../../../model/userModel");

const inspeksiAmparLempointController = {
  startAmparLemPoint: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiAmparLemPoint = await InspeksiAmparLemPoint.findByPk(_id);
      if (inspeksiAmparLemPoint.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiAmparLemPoint.update(
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

        for (let index = 0; index < data_defect.length; index++) {
          await InspeksiAmparLemDefect.update(
            { hasil: data_defect[index].hasil },
            { where: { id: data_defect[index].id } }
          );
        }
      }

      await InspeksiAmparLemPoint.update(
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

  createInspeksiAmparLemPoint: async (req, res) => {
    const { id_inspeksi_ampar_lem } = req.body;
    try {
      //const masterKodepond = await MasterKodeMasalahRabut.findAll();

      const pondPeriodePoint = await InspeksiAmparLemPoint.create({
        id_inspeksi_ampar_lem: id_inspeksi_ampar_lem,
      });
      // for (let i = 0; i < masterKodepond.length; i++) {
      //   await InspeksiAmparLemDefect.create({
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
  createInspeksiAmparLemPointDefect: async (req, res) => {
    const {
      id_inspeksi_ampar_lem,
      id_inspeksi_ampar_lem_point,
      id_defect,
      MasterDefect,
      kode_lkh,
      masalah_lkh,
    } = req.body;

    try {
      // const MasterDefect = await MasterKodeMasalahRabut.findOne({
      //   where: { id: id_defect },
      // });

      const ampatLemDefect = await InspeksiAmparLemDefect.create({
        id_inspeksi_ampar_lem_point: id_inspeksi_ampar_lem_point,
        kode: MasterDefect.e_kode_produksi,
        masalah: MasterDefect.nama_kendala,
        kode_lkh: kode_lkh,
        masalah_lkh: masalah_lkh,
        kriteria: MasterDefect.criteria,
        persen_kriteria: MasterDefect.criteria_percent,
        sumber_masalah: MasterDefect.kategori_kendala,
        id_inspeksi_ampar_lem: id_inspeksi_ampar_lem,
      });

      // untuk department ketika data udah dari p1
      for (let ii = 0; ii < MasterDefect.target_department.length; ii++) {
        const depart = MasterDefect.target_department[ii];
        await InspeksiAmparLemDefectDepartment.create({
          id_inspeksi_ampar_lem_periode_point_defect: ampatLemDefect.id,
          id_department: parseInt(depart.id_department),
          nama_department: depart.nama_department,
        });
      }
      // for (let index = 0; index < MasterDefect.department.length; index++) {
      //   const element = array[index];

      // }

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  istirahatAmparLemPoint: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiAmparLemPoint.update(
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

  istirahatMasukAmparLemPoint: async (req, res) => {
    const _id = req.params.id;
    const { lama_istirahat } = req.body;
    try {
      await InspeksiAmparLemPoint.update(
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

module.exports = inspeksiAmparLempointController;
