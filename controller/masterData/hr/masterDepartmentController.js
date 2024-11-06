const masterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");

const masterShiftController = {
  getMasterDepartment: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterDepartment.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterDepartment.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterDepartment: async (req, res) => {
    const { nama_department } = req.body;

    try {
      await masterDepartment.create({ nama_department }),
        res.status(201).json({ msg: "Master Divisi create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterDepartment: async (req, res) => {
    const _id = req.params.id;
    const { nama_department } = req.body;

    let obj = {};
    if (nama_department) obj.nama_department = nama_department;

    try {
      await masterDepartment.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
