const masterJenisKertas = require("../../model/masterData/masterJenisKertasModel");

const masterJenisKertasController = {
  getMasterJenisKertas: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { jenis, bobot } = req.query;

    let obj = { is_active: true };
    if (jenis) obj.jenis = jenis;
    if (bobot) obj.bobot = bobot;

    try {
      if (_id) {
        const response = await masterJenisKertas.findByPk(_id);
        res.status(200).json({ data: response });
      } else {
        const response = await masterJenisKertas.findAll({ where: obj });
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterJenisKertas: async (req, res) => {
    const { jenis, bobot } = req.body;

    try {
      const response = await masterJenisKertas.create({
        jenis,
        bobot,
      });
      res.status(200).json({ msg: "cretae Successfuly", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterJenisKertas: async (req, res) => {
    const _id = req.params.id;
    const { jenis, bobot } = req.body;

    let obj = {};
    if (jenis) obj.jenis = jenis;
    if (bobot) obj.bobot = bobot;

    try {
      await masterJenisKertas.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterJenisKertas: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterJenisKertas.update(
        { is_active: false },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterJenisKertasController;
