const masterPayroll = require("../../../model/masterData/hr/masterPayrollModel");

const masterShiftController = {
  getMasterPayroll: async (req, res) => {
    const _id = req.params.id;
    console.log(_id);
    try {
      if (_id) {
        const response = await masterPayroll.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterPayroll.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterPayroll: async (req, res) => {
    const { uang_makan_lembur_per, upah_sakit } = req.body;

    let obj = {};
    if (uang_makan_lembur_per)
      obj.uang_makan_lembur_per = uang_makan_lembur_per;
    if (upah_sakit) obj.upah_sakit = upah_sakit;

    try {
      await masterPayroll.update(obj, { where: { id: 1 } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
