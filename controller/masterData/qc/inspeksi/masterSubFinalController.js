const masterSubFinal = require("../../../../model/masterData/qc/inspeksi/masterSubFinalModel");

const masterSubFinalController = {
  getMasterSubFinal: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { quantity,jumlah,kualitas_lulus,kualitas_tolak } = req.query;

    let obj = {};

    if (quantity) obj.quantity = quantity;
    if (jumlah) obj.jumlah = jumlah;
    if (kualitas_lulus) obj.kualitas_lulus = kualitas_lulus;
    if (kualitas_tolak) obj.kualitas_tolak = kualitas_tolak;

    try {
      if (!_id) {
        const response = await masterSubFinal.findAll({ where: obj });
        res.status(200).json(response);
      } else {
        const response = await masterSubFinal.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterSubFinal: async (req, res) => {
    const { quantity,jumlah,kualitas_lulus,kualitas_tolak } = req.body;
    if (!jumlah || !quantity || !kualitas_lulus || !kualitas_tolak)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterSubFinal.create({
        quantity,jumlah,kualitas_lulus,kualitas_tolak
      });
      res.status(200).json({ msg: "create successful", data: response });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterSubFinal: async (req, res) => {
    const _id = req.params.id;
    const { quantity,jumlah,kualitas_lulus,kualitas_tolak } = req.body;

    let obj = {};
    if (quantity) obj.quantity = quantity;
    if (jumlah) obj.jumlah = jumlah;
    if (kualitas_lulus) obj.kualitas_lulus = kualitas_lulus;
    if (kualitas_tolak) obj.kualitas_tolak = kualitas_tolak;
    try {
      await masterSubFinal.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "masalah update Successful" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterSubFinal: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterSubFinal.destroy({where: {id:_id}})
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterSubFinalController;
