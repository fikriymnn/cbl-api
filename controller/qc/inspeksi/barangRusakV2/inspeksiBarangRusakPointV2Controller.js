const { Op, Sequelize, where } = require("sequelize");

const InspeksiBarangRusakPointV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const InspeksiBarangRusakDefectV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Model");
const User = require("../../../../model/userModel");
const db = require("../../../../config/database");

const inspeksiBarangRusakpointV2Controller = {
  startBarangRusakV2Point: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiBarangRusakPointV2 =
        await InspeksiBarangRusakPointV2.findByPk(_id);
      if (inspeksiBarangRusakPointV2.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiBarangRusakPointV2.update(
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

  stopBarangRusakV2Point: async (req, res) => {
    const _id = req.params.id;
    const { catatan, lama_pengerjaan, jumlah_defect } = req.body;
    if (!jumlah_defect)
      return res.status(400).json({ msg: "Jumlah Defect Wajib di Isi" });

    if (!lama_pengerjaan)
      return res.status(400).json({ msg: "Incomplite Data" });
    try {
      await InspeksiBarangRusakPointV2.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          lama_pengerjaan,
          catatan,
          jumlah_defect,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Stop Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  createInspeksiBarangRusakPointV2: async (req, res) => {
    const { id_inspeksi_barang_rusak_v2, nama_pengecekan } = req.body;
    try {
      //const masterKodepond = await MasterKodeMasalahRabut.findAll();

      const pondPeriodePoint = await InspeksiBarangRusakPointV2.create({
        id_inspeksi_barang_rusak_v2: id_inspeksi_barang_rusak_v2,
        nama_pengecekan,
      });

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  updateInspeksiBarangRusakPointV2: async (req, res) => {
    const _id = req.params.id;
    const { data_pengecekan } = req.body;
    const t = await db.transaction();
    try {
      //const masterKodepond = await MasterKodeMasalahRabut.findAll();
      const data = await InspeksiBarangRusakPointV2.findByPk(_id);
      if (!data) return res.status(404).json({ msg: "data point not found!!" });
      if (!data_pengecekan) res.status(404).json({ msg: "data point empty!!" });

      await InspeksiBarangRusakPointV2.update(
        {
          catatan: data_pengecekan.catatan,
          jumlah_defect: data_pengecekan.jumlah_defect,
          id_inspektor_edit: req.user.id,
        },
        { where: { id: _id }, transaction: t }
      );

      for (
        let i = 0;
        i < data_pengecekan.inspeksi_barang_rusak_defect_v2.length;
        i++
      ) {
        const e = data_pengecekan.inspeksi_barang_rusak_defect_v2[i];
        await InspeksiBarangRusakDefectV2.update(
          {
            kode: e.kode,
            kode_lkh: e.kode_lkh,
            masalah: e.masalah,
            masalah_lkh: e.masalah_lkh,
            jumlah_defect: e.jumlah_defect,
          },
          { where: { id: e.id }, transaction: t }
        );
      }

      await t.commit();

      res.status(200).json({ msg: "edit Successful" });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({ msg: error.message });
    }
  },

  istirahatBarangRusakPointV2: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiBarangRusakPointV2.update(
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

  istirahatMasukBarangRusakPointV2: async (req, res) => {
    const _id = req.params.id;
    const { lama_istirahat } = req.body;
    try {
      await InspeksiBarangRusakPointV2.update(
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

module.exports = inspeksiBarangRusakpointV2Controller;
