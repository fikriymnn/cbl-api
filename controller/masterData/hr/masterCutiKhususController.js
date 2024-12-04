const masterCutiKhusus = require("../../../model/masterData/hr/masterCutiKhususModel");

const masterShiftController = {
  getMasterCutiKhusus: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterCutiKhusus.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterCutiKhusus.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterCutiKhusus: async (req, res) => {
    const { nama_cuti, jumlah_hari } = req.body;

    try {
      await masterCutiKhusus.create({ nama_cuti, jumlah_hari }),
        res.status(201).json({ msg: "Master Cuti create Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterCutiKhusus: async (req, res) => {
    const _id = req.params.id;
    const { nama_cuti, jumlah_hari } = req.body;

    let obj = {};
    if (nama_cuti) obj.nama_cuti = nama_cuti;
    if (jumlah_hari) obj.jumlah_hari = jumlah_hari;

    try {
      await masterCutiKhusus.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterCutiKhusus: async (req, res) => {
    const _id = req.params.id;

    try {
      await masterCutiKhusus.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
