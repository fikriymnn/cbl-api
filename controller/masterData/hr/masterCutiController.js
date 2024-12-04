const masterCuti = require("../../../model/masterData/hr/masterCutiModel");

const masterShiftController = {
  getMasterCuti: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterCuti.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterCuti.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterCuti: async (req, res) => {
    const { jumlah_hari } = req.body;

    let obj = {};
    if (jumlah_hari) obj.jumlah_hari = jumlah_hari;

    try {
      await masterCuti.create({ jumlah_hari }),
        res.status(201).json({ msg: "Master Cuti create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterCuti: async (req, res) => {
    const _id = req.params.id;
    const { jumlah_hari } = req.body;

    let obj = {};
    if (jumlah_hari) obj.jumlah_hari = jumlah_hari;

    try {
      await masterCuti.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
