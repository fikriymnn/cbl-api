const masterKodeMasalahLem = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahLemModel");

const masterKodeMasalahLemController = {
  getMasterKodeMasalahLem: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { kode, masalah, status } = req.query;

    let obj = {};

    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;
    if (status) obj.status = status;

    try {
      if (!_id) {
        const response = await masterKodeMasalahLem.findAll({ where: obj });
        res.status(200).json(response);
      } else {
        const response = await masterKodeMasalahLem.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKodeMasalahLem: async (req, res) => {
    const { kode, masalah, sumber_masalah, kriteria, persen_kriteria } =
      req.body;
    if (!kode || !masalah || !sumber_masalah || !kriteria || !persen_kriteria)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterKodeMasalahLem.create({
        kode,
        masalah,
        sumber_masalah,
        kriteria,
        persen_kriteria,
      });
      res.status(200).json({ msg: "create successful", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterKodeMasalahLem: async (req, res) => {
    const _id = req.params.id;
    const { kode, masalah, sumber_masalah, kriteria, persen_kriteria } =
      req.body;

    let obj = {};
    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;
    if (sumber_masalah) obj.sumber_masalah = sumber_masalah;
    if (kriteria) obj.kriteria = kriteria;
    if (persen_kriteria) obj.persen_kriteria = persen_kriteria;

    try {
      await masterKodeMasalahLem.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterKodeMasalahLem: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterKodeMasalahLem.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterKodeMasalahLemController;
