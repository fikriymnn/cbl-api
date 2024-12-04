const masterSkorPerbaikan = require("../../../model/masterData/mtc/masterSkorJenisPerbaikanModel");

const masterSkorPerbaikanController = {
  getMasterSkorPerbaikan: async (req, res) => {
    try {
      const response = await masterSkorPerbaikan.findAll();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMasterSkorPerbaikanId: async (req, res) => {
    try {
      const response = await masterSkorPerbaikan.findByPk(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createSkorPerbaikan: async (req, res) => {
    const { skor, nama_skor } = req.body;
    if (!skor || !nama_skor)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterSkorPerbaikan.create({
        skor,
        nama_skor,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateSkorPerbaikan: async (req, res) => {
    const _id = req.params.id;
    const { skor, nama_skor } = req.body;

    let obj = {};
    if (skor) obj.skor = skor;
    if (nama_skor) obj.nama_skor = nama_skor;

    try {
      await masterSkorPerbaikan.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Machine update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteSkorPerbaikan: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterSkorPerbaikan.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterSkorPerbaikanController;
