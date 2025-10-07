const masterJenisWarnaTinta = require("../../model/masterData/masterJenisWarnaTintaModel");

const masterJenisWarnaTintaController = {
  getMasterJenisWarnaTinta: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { jenis } = req.query;

    let obj = { is_active: true };
    if (jenis) obj.jenis = jenis;

    try {
      if (_id) {
        const response = await masterJenisWarnaTinta.findByPk(_id);
        res.status(200).json({ data: response });
      } else {
        const response = await masterJenisWarnaTinta.findAll({ where: obj });
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterJenisWarnaTinta: async (req, res) => {
    const { jenis } = req.body;

    try {
      const response = await masterJenisWarnaTinta.create({
        jenis,
      });
      res.status(200).json({ msg: "cretae Successfuly", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterJenisWarnaTinta: async (req, res) => {
    const _id = req.params.id;
    const { jenis } = req.body;

    let obj = {};
    if (jenis) obj.jenis = jenis;

    try {
      await masterJenisWarnaTinta.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterJenisWarnaTinta: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterJenisWarnaTinta.update(
        { is_active: false },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterJenisWarnaTintaController;
