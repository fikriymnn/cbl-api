const masterPointFinal = require("../../../../model/masterData/qc/inspeksi/masterPointFinalModel");
const InspeksiMasterPointOutsourcing = require("../../../../model/masterData/qc/inspeksi/masterPointOutsourcing");

const MasterPointOutsourcingController = {
  getMasterPointOutsourcing: async (req, res) => {
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
        const response = await InspeksiMasterPointOutsourcing.findAll({ where: obj });
        res.status(200).json(response);
      } else {
        const response = await InspeksiMasterPointOutsourcing.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterPointOutsourcing: async (req, res) => {
    const { point, standar, cara_periksa, status } = req.body;
    if (!point || !standar || !cara_periksa)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await InspeksiMasterPointOutsourcing.create({
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

  updateMasterPointOutsourcing: async (req, res) => {
    const _id = req.params.id;
    const { point, standar, cara_periksa, status } = req.body;

    let obj = {};
    if (point) obj.point = point;
    if (standar) obj.standar = standar;
    if (cara_periksa) obj.cara_periksa = cara_periksa;
    if (status) obj.status = status;

    try {
      await InspeksiMasterPointOutsourcing.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterPointOutsourcing: async (req, res) => {
    const _id = req.params.id;
    try {
      await InspeksiMasterPointOutsourcing.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "point Outsourcing delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = MasterPointOutsourcingController;