const masterJenisTinta = require("../../model/masterData/masterJenisTintaModel");

const masterJenisTintaController = {
  getMasterJenisTinta: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { jenis, bobot } = req.query;

    let obj = { is_active: true };
    if (jenis) obj.jenis = jenis;
    if (bobot) obj.bobot = bobot;

    try {
      if (_id) {
        const response = await masterJenisTinta.findByPk(_id);
        res.status(200).json({ data: response });
      } else {
        const response = await masterJenisTinta.findAll({ where: obj });
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterJenisTinta: async (req, res) => {
    const { jenis, bobot } = req.body;

    try {
      const response = await masterJenisTinta.create({
        jenis,
        bobot,
      });
      res.status(200).json({ msg: "cretae Successfuly", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterJenisTinta: async (req, res) => {
    const _id = req.params.id;
    const { jenis, bobot } = req.body;

    let obj = {};
    if (jenis) obj.jenis = jenis;
    if (bobot) obj.bobot = bobot;

    try {
      await masterJenisTinta.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterJenisTinta: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterJenisTinta.update(
        { is_active: false },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterJenisTintaController;
