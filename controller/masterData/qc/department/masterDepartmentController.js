const MasterDepartment = require("../../../../model/masterData/qc/department/masterDepartmentModel");

const masterDepartment = {
  getMasterDepartment: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { department } = req.query;

    let obj = {};

    if (department) obj.nama_department = department;

    try {
      if (!_id) {
        const response = await MasterDepartment.findAll({
          where: obj,
        });
        res.status(200).json(response);
      } else {
        const response = await MasterDepartment.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterDepartment: async (req, res) => {
    const { nama_department, value_department } = req.body;
    if (!nama_department || !value_department)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await MasterDepartment.create({
        nama_department,
        value_department,
      });
      res.status(200).json({ msg: "create successful", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterDepartment: async (req, res) => {
    const _id = req.params.id;
    const { nama_department, value_department } = req.body;

    let obj = {};
    if (nama_department) obj.nama_department = nama_department;
    if (value_department) obj.value_department = value_department;

    try {
      await MasterDepartment.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterDepartment: async (req, res) => {
    const _id = req.params.id;
    try {
      await MasterDepartment.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterDepartment;
