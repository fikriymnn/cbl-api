const masterPointFinal = require("../../../../model/masterData/qc/inspeksi/masterPointFinalModel");

const MasterPointFinalController = {
  getMasterPointFinal: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { point, standar, cara_periksa, status } = req.query;

    let obj = {};

    if (point) obj.point = point;
    if (standar) obj.standar = standar;
    if (cara_periksa) obj.cara_periksa = cara_periksa;
    if (status) obj.status = status;

    try {
      if (!_id) {
        const response = await masterPointFinal.findAll({ where: obj });
        res.status(200).json(response);
      } else {
        const response = await masterPointFinal.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterPointFinal: async (req, res) => {
    const { point, standar, cara_periksa, status } = req.body;
    if (!point || !standar || !cara_periksa)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterPointFinal.create({
        point,
        standar,
        cara_periksa,
        status: "active",
      });
      res.status(200).json({ msg: "create successful", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterPointFinal: async (req, res) => {
    const _id = req.params.id;
    const { point, standar, cara_periksa, status } = req.body;

    let obj = {};
    if (point) obj.point = point;
    if (standar) obj.standar = standar;
    if (cara_periksa) obj.cara_periksa = cara_periksa;
    if (status) obj.status = status;

    try {
      await masterPointFinal.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterPointFinal: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterPointFinal.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "point final delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = MasterPointFinalController;
