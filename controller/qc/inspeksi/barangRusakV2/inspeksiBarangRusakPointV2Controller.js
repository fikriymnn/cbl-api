const { Op, Sequelize, where } = require("sequelize");

const InspeksiBarangRusakPointV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const User = require("../../../../model/userModel");

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
