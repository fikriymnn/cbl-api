const { Op, Sequelize, where } = require("sequelize");
const InspeksiBarangRusak = require("../../../../model/qc/inspeksi/barangRusak/inspeksiBarangRusakModel");
const InspeksiBarangRusakDefect = require("../../../../model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const MasterKodeMasalahBarangRusak = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahBarangRusak");
const User = require("../../../../model/userModel");

const inspeksiBarangRusakController = {
  startbarangRusakDefect: async (req, res) => {
    const _id = req.params.id;
    try {
      const inspeksiBarangRusakDefect =
        await InspeksiBarangRusakDefect.findByPk(_id);
      if (inspeksiBarangRusakDefect.id_inspektor != null)
        return res.status(400).json({ msg: "sudah ada user yang mulai" });
      await InspeksiBarangRusakDefect.update(
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

  stopCetakPeriodePoint: async (req, res) => {
    const _id = req.params.id;
    const { catatan, setting_awal, druk_awal, lama_pengerjaan } = req.body;
    if (!setting_awal)
      return res.status(400).json({ msg: "Setting awal wajib di isi" });
    if (!druk_awal)
      return res.status(400).json({ msg: "Druk awal wajib di isi" });
    if (!lama_pengerjaan)
      return res.status(400).json({ msg: "Lama pengerjaan wajib di isi" });

    try {
      const subTotal = setting_awal + druk_awal;
      await InspeksiBarangRusakDefect.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          lama_pengerjaan,
          catatan,
          setting_awal,
          druk_awal,
          sub_total: subTotal,
        },
        { where: { id: _id } }
      );
      res.status(200).json({ msg: "Stop Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },

  addInspeksiBarangRusak: async (req, res) => {
    const _id = req.params.id;
    const { kode, masalah, asal_temuan } = req.body;
    try {
      await InspeksiBarangRusakDefect.create({
        id_inspeksi_barang_rusak: _id,
        kode: kode,
        masalah: masalah,
        asal_temuan: asal_temuan,
      });

      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiBarangRusakController;
