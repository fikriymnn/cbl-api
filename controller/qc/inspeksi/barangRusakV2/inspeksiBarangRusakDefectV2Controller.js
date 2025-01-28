const { Op, Sequelize, where } = require("sequelize");

const InspeksiBarangRusakV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Model");
const InspeksiBarangRusakPointV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const InspeksiBarangRusakDefectV2 = require("../../../../model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Model");
const User = require("../../../../model/userModel");
const db = require("../../../../config/database");

const inspeksiBarangRusakController = {
  simpanBarangRusakDefectV2: async (req, res) => {
    const _id = req.params.id;
    const { catatan, jumlah_defect, file } = req.body;

    if (!jumlah_defect)
      return res.status(400).json({ msg: "Druk awal wajib di isi" });

    const t = await db.transaction();

    try {
      await InspeksiBarangRusakDefectV2.update(
        {
          waktu_selesai: new Date(),
          status: "done",
          catatan,
          jumlah_defect,
        },
        { where: { id: _id }, transaction: t }
      );
      await t.commit();
      res.status(200).json({ msg: "Simpan Successful" });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({ msg: error.message });
    }
  },

  addInspeksiBarangRusakDefectV2V2: async (req, res) => {
    const {
      id_barang_rusak_v2,
      id_barang_rusak_point_v2,
      MasterDefect,
      kode_lkh,
      masalah_lkh,
      asal_temuan,
    } = req.body;
    const t = await db.transaction();
    try {
      const dataRusak = await InspeksiBarangRusakV2.findByPk(
        id_barang_rusak_v2
      );
      const dataPoint = await InspeksiBarangRusakPointV2.findByPk(
        id_barang_rusak_point_v2
      );

      if (!dataRusak)
        return res
          .status(404)
          .json({ msg: "data barang rusak tidak ditemukan" });
      if (!dataPoint)
        return res
          .status(404)
          .json({ msg: "data barang rusak point tidak ditemukan" });

      await InspeksiBarangRusakDefectV2.create(
        {
          id_inspeksi_barang_rusak_v2: id_barang_rusak_v2,
          id_inspeksi_barang_rusak_point_v2: id_barang_rusak_point_v2,
          kode: MasterDefect.e_kode_produksi,
          masalah: MasterDefect.nama_kendala,
          asal_temuan: asal_temuan,
          kode_lkh,
          masalah_lkh,
          nama_pengecekan: dataPoint.nama_pengecekan,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({ msg: "Create Successful" });
    } catch (error) {
      await t.rollback();
      return res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiBarangRusakController;
