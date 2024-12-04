const masterAbsensi = require("../../../model/masterData/hr/masterAbsensiModel");

const masterShiftController = {
  getMasterAbsensi: async (req, res) => {
    try {
      const response = await masterAbsensi.findByPk(1);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterAbsensi: async (req, res) => {
    const { toleransi_kedatangan_menit, toleransi_pulang_menit } = req.body;

    let obj = {};
    if (toleransi_kedatangan_menit)
      obj.toleransi_kedatangan_menit = toleransi_kedatangan_menit;
    if (toleransi_pulang_menit)
      obj.toleransi_pulang_menit = toleransi_pulang_menit;

    try {
      await masterAbsensi.update(obj, { where: { id: 1 } }),
        res.status(201).json({ msg: "Master update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
