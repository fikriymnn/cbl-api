const masterShift = require("../../../model/masterData/hr/masterShiftModel");

const masterShiftController = {
  getMasterShift: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterShift.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterShift.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterShift: async (req, res) => {
    const _id = req.params.id;
    const { shift_1_masuk, shift_1_keluar, shift_2_masuk, shift_2_keluar } =
      req.body;

    let obj = {};
    if (shift_1_masuk) obj.shift_1_masuk = shift_1_masuk;
    if (shift_1_keluar) obj.shift_1_keluar = shift_1_keluar;
    if (shift_2_masuk) obj.shift_2_masuk = shift_2_masuk;
    if (shift_2_keluar) obj.shift_2_keluar = shift_2_keluar;

    try {
      await masterShift.update(obj, { where: { hari: _id } }),
        res.status(201).json({ msg: "Shift update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
