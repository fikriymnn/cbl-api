const masterKodeMasalahBarangRusak = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahBarangRusak");

const masterKodeMasalahBarangRusakController = {
  getMasterKodeMasalahBarangRusak: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { kode, masalah, status, asal_temuan } = req.query;

    let obj = {};

    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;
    if (status) obj.status = status;
    if (asal_temuan) obj.asal_temuan = asal_temuan;

    try {
      if (!_id) {
        const response = await masterKodeMasalahBarangRusak.findAll({
          where: obj,
        });
        res.status(200).json(response);
      } else {
        const response = await masterKodeMasalahBarangRusak.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKodeMasalahBarangRusak: async (req, res) => {
    const { kode, masalah, asal_temuan } = req.body;
    if (!kode || !masalah || !asal_temuan)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterKodeMasalahBarangRusak.create({
        kode,
        masalah,
        asal_temuan,
      });
      res.status(200).json({ msg: "create successful", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterKodeMasalahBarangRusak: async (req, res) => {
    const _id = req.params.id;
    const { kode, masalah, asal_temuan } = req.body;

    let obj = {};
    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;
    if (asal_temuan) obj.asal_temuan = asal_temuan;

    try {
      await masterKodeMasalahBarangRusak.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterKodeMasalahBarangRusak: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterKodeMasalahBarangRusak.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterKodeMasalahBarangRusakController;
