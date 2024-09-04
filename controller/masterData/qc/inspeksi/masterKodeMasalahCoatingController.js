const MasterKodeMasalahCoating = require("../../../../model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");

const MasterKodeMasalahCoatingController = {
  getMasterKodeMasalahCoating: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { kode, masalah, status } = req.query;

    let obj = {};

    if (kode) obj.kode = kode;
    if (masalah) obj.masalah = masalah;
    if (status) obj.status = status;

    try {
      if (!_id) {
        const response = await MasterKodeMasalahCoating.findAll({ where: obj });
        res.status(200).json(response);
      } else {
        const response = await MasterKodeMasalahCoating.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKodeMasalahCoating: async (req, res) => {
    const { kode, masalah, sumber_masalah, kriteria, persen_kriteria } =
      req.body;
    if (!kode || !masalah || !sumber_masalah || !kriteria || !persen_kriteria)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await MasterKodeMasalahCoating.create({
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

  updateMasterKodeMasalahCoating: async (req, res) => {
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
      await MasterKodeMasalahCoating.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterKodeMasalahCoating: async (req, res) => {
    const _id = req.params.id;
    try {
      await MasterKodeMasalahCoating.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = MasterKodeMasalahCoatingController;
