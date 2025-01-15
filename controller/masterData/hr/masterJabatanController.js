const masterJabatan = require("../../../model/masterData/hr/masterJabatanModel");

const masterJabatanController = {
  getMasterJabatan: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterJabatan.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterJabatan.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterJabatan: async (req, res) => {
    const { nama_jabatan } = req.body;

    try {
      await masterJabatan.create({ nama_jabatan }),
        res.status(201).json({ msg: "Master jabatan create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterJabatan: async (req, res) => {
    const _id = req.params.id;
    const { nama_jabatan } = req.body;

    let obj = {};
    if (nama_jabatan) obj.nama_jabatan = nama_jabatan;

    try {
      await masterJabatan.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master jabatan update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterJabatanController;
