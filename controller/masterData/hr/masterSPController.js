const masterSP = require("../../../model/masterData/hr/masterSPModel");

const masterSPController = {
  getMasterSP: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterSP.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterSP.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterSP: async (req, res) => {
    const { nama, masa_berlaku } = req.body;

    if (!nama) return res.status(404).json({ msg: "nama wajib di isi" });
    if (!masa_berlaku)
      return res.status(404).json({ msg: "masa berlaku wajib di isi" });

    try {
      await masterSP.create({ nama, masa_berlaku }),
        res.status(201).json({ msg: "Master SP create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterSP: async (req, res) => {
    const _id = req.params.id;
    const { nama, masa_berlaku } = req.body;

    let obj = {};
    if (masa_berlaku) obj.masa_berlaku = masa_berlaku;
    if (nama) obj.nama = nama;

    try {
      await masterSP.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master SP update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterSPController;
