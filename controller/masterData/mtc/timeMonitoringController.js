const MasterTimeMonitoring = require("../../../model/masterData/mtc/timeMonitoringModel");

const masterTimeMonitoringController = {
  getMasterTimeMonitoring: async (req, res) => {
    try {
      const response = await MasterTimeMonitoring.findAll();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMasterTimeMonitoringById: async (req, res) => {
    try {
      const response = await MasterTimeMonitoring.findByPk(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterTimeMonitoring: async (req, res) => {
    const { waktu, jenis, minimal_skor } = req.body;
    if (!waktu || !jenis || !minimal_skor)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await MasterTimeMonitoring.create({
        waktu,
        jenis,
        minimal_skor,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterTimeMonitoring: async (req, res) => {
    const _id = req.params.id;
    const { waktu, jenis, minimal_skor } = req.body;

    let obj = {};
    if (waktu) obj.waktu = waktu;
    if (jenis) obj.jenis = jenis;
    if (minimal_skor) obj.minimal_skor = minimal_skor;

    try {
      await MasterTimeMonitoring.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Machine update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterTimeMonitoring: async (req, res) => {
    const _id = req.params.id;
    try {
      await MasterTimeMonitoring.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterTimeMonitoringController;
