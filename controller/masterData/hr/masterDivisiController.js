const { where } = require("sequelize");
const masterDivisi = require("../../../model/masterData/hr/masterDivisiModel");

const masterShiftController = {
  getMasterDivisi: async (req, res) => {
    const _id = req.params.id;
    const { is_active } = req.query;
    try {
      let obj = {};
      if (is_active) obj.is_active = is_active == "true" ? true : false;
      if (_id) {
        const response = await masterDivisi.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterDivisi.findAll({ where: obj });
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterDivisi: async (req, res) => {
    const { nama_divisi } = req.body;

    try {
      await masterDivisi.create({ nama_divisi }),
        res.status(201).json({ msg: "Master Divisi create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterDivisi: async (req, res) => {
    const _id = req.params.id;
    const { nama_divisi } = req.body;

    let obj = {};
    if (nama_divisi) obj.nama_divisi = nama_divisi;

    try {
      await masterDivisi.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  nonactiveMasterDivisi: async (req, res) => {
    const _id = req.params.id;

    try {
      await masterDivisi.update({ is_active: false }, { where: { id: _id } });
      res.status(201).json({ msg: "Master Divisi update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
