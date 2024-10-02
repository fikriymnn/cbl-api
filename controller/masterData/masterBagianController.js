const masterBagian = require("../../model/masterData/masterBagian");
const masterSparepart = require("../../model/masterData/masterSparepart");

const masterBagianController = {
  getMasterBagian: async (req, res) => {
    const id = req.params.id;
    const { status } = req.body;

    try {
      if (id) {
        const response = await masterBagian.findByPk(id);
        res.status(200).json(response);
      } else if (status) {
        const response = await masterBagian.findAll({
          where: { status: status },
        });
      } else {
        const response = await masterBagian.findAll();
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterBagian: async (req, res) => {
    const { nama_bagian } = req.body;
    if (!nama_bagian)
      return res.status(404).json({ msg: "nama bagian wajib di isi!!" });

    try {
      const response = await masterBagian.create({
        nama_bagian,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterBagian: async (req, res) => {
    const _id = req.params.id;
    const { nama_bagian } = req.body;

    let obj = {};
    if (nama_bagian) obj.nama_bagian = nama_bagian;

    try {
      await masterBagian.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Bagian update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterBagian: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterBagian.update(
        { status: "non active" },
        { where: { id: _id } }
      ),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterBagianController;
