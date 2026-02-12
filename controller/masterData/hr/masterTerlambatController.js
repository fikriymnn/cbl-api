const masterTerlambat = require("../../../model/masterData/hr/masterTerlambatModel");

const masterShiftController = {
  getMasterTerlambat: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterTerlambat.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterTerlambat.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterTerlambat: async (req, res) => {
    const { alasan_terlambat, jumlah_jam } = req.body;

    try {
      (await masterTerlambat.create({ alasan_terlambat, jumlah_jam }),
        res.status(201).json({ msg: "Master Cuti create Successfuly" }));
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterTerlambat: async (req, res) => {
    const _id = req.params.id;
    const { alasan_terlambat, jumlah_jam } = req.body;

    let obj = {};
    if (alasan_terlambat) obj.alasan_terlambat = alasan_terlambat;
    if (jumlah_jam) obj.jumlah_jam = jumlah_jam;

    try {
      (await masterTerlambat.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti update Successfuly" }));
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterTerlambat: async (req, res) => {
    const _id = req.params.id;

    try {
      (await masterTerlambat.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Master Cuti delete Successfuly" }));
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterShiftController;
