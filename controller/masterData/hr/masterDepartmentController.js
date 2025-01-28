const masterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");

const masterShiftController = {
  getMasterDepartment: async (req, res) => {
    const _id = req.params.id;
    const { is_active } = req.query;

    let obj = {};

    if (is_active && is_active == "true") {
      obj.is_active = true;
    } else if (is_active && is_active == "false") {
      obj.is_active = false;
    }

    try {
      if (_id) {
        const response = await masterDepartment.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterDepartment.findAll({
          where: obj,
        });
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
        res.status(201).json({ msg: "Master Department update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterDepartment: async (req, res) => {
    const _id = req.params.id;

    try {
      await masterDepartment.update(
        { is_active: false },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "Master Department delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
