const masterBagianHr = require("../../../model/masterData/hr/masterBagianModel");

const masterShiftController = {
  getMasterBagianHr: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterBagianHr.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterBagianHr.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterBagianHr: async (req, res) => {
    const { nama_bagian } = req.body;

    try {
      await masterBagianHr.create({ nama_bagian }),
        res.status(201).json({ msg: "Master Divisi create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterBagianHr: async (req, res) => {
    const _id = req.params.id;
    const { nama_bagian } = req.body;

    let obj = {};
    if (nama_bagian) obj.nama_bagian = nama_bagian;

    try {
      await masterBagianHr.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
