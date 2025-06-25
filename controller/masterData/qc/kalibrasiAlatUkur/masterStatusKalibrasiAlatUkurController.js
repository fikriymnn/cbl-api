const masterStatusKalibrasiAlatUkur = require("../../../../model/masterData/qc/kalibrasiAlatUkur/masterStatusKalibrasiAlatUkurModel");

const masterStatusKalibrasiAlatUkurController = {
  getMasterStatusKalibrasiAlatUkur: async (req, res) => {
    const id = req.params.id;

    try {
      if (id) {
        const response = await masterStatusKalibrasiAlatUkur.findByPk(id);
        res.status(200).json({ data: response });
      } else {
        const response = await masterStatusKalibrasiAlatUkur.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterStatusKalibrasiAlatUkur: async (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(404).json({ msg: "status wajib di isi!!" });

    try {
      const response = await masterStatusKalibrasiAlatUkur.create({
        status,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterStatusKalibrasiAlatUkur: async (req, res) => {
    const _id = req.params.id;
    const { status } = req.body;

    let obj = {};
    if (status) obj.status = status;

    try {
      await masterStatusKalibrasiAlatUkur.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterStatusKalibrasiAlatUkurController;
