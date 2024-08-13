const masterKodeMasalahCetak = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCetakModel");

const masterKodeMasalahCetakController = {
  getMasterKodeMasalahCetak: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { kode, masalah, status } = req.query;

    let obj = {};

    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;
    if (status) obj.status = status;

    try {
      if (!_id) {
        const response = await masterKodeMasalahCetak.findAll({ where: obj });
        res.status(200).json(response);
      } else {
        const response = await masterKodeMasalahCetak.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKodeMasalahCetak: async (req, res) => {
    const { kode, masalah } = req.body;
    if (!kode || !masalah)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterKodeMasalahCetak.create({
        kode,
        masalah,
      });
      res.status(200).json({ msg: "create successful", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterKodeMasalahCetak: async (req, res) => {
    const _id = req.params.id;
    const { kode, masalah } = req.body;

    let obj = {};
    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;

    try {
      await masterKodeMasalahCetak.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterKodeMasalahCetak: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterKodeMasalahCetak.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterKodeMasalahCetakController;
