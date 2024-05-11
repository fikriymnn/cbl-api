const masterKodeAnalisis = require("../../../model/masterData/masterKodeAnalisisModel");

const masterKodeAnalisisController = {
  getMasterKode: async (req, res) => {
    const { bagian_analisis } = req.query;
    let obj = {};

    if (bagian_analisis) obj.bagian_analisis = bagian_analisis;
    try {
      const response = await masterKodeAnalisis.findAll({ where: obj });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMasterKodeById: async (req, res) => {
    try {
      const response = await masterKodeAnalisis.findByPk(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKode: async (req, res) => {
    const { kode_analisis, nama_analisis, bagian_analisis } = req.body;
    if (!kode_analisis || !nama_analisis || !bagian_analisis)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterKodeAnalisis.create({
        kode_analisis,
        nama_analisis,
        bagian_analisis,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterKode: async (req, res) => {
    const _id = req.params.id;
    const { kode_analisis, nama_analisis, bagian_analisis } = req.body;

    let obj = {};
    if (kode_analisis) obj.kode_analisis = kode_analisis;
    if (nama_analisis) obj.nama_analisis = nama_analisis;
    if (bagian_analisis) obj.bagian_analisis = bagian_analisis;

    try {
      await masterKodeAnalisis.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Machine update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterKode: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterKodeAnalisis.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterKodeAnalisisController;
