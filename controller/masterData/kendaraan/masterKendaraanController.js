const { Op, Sequelize, where } = require("sequelize");
const MasterKendaraan = require("./service/masterKendaraanService");

const MasterKendaraanController = {
  getMasterKendaraan: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, search } = req.query;

    try {
      const getData = await MasterKendaraan.getMasterKendaraanService({
        id: _id,
        page: page,
        limit: limit,
        start_date: start_date,
        end_date: end_date,
        search: search,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createMasterKendaraan: async (req, res) => {
    const { nomor_kendaraan, nama_kendaraan } = req.body;

    try {
      const getData = await MasterKendaraan.creteMasterKendaraanService({
        nomor_kendaraan: nomor_kendaraan,
        nama_kendaraan: nama_kendaraan,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterKendaraan: async (req, res) => {
    const _id = req.params.id;
    const { nomor_kendaraan, nama_kendaraan } = req.body;

    try {
      const getData = await MasterKendaraan.updateMasterKendaraanService({
        id: _id,
        nomor_kendaraan: nomor_kendaraan,
        nama_kendaraan: nama_kendaraan,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteMasterKendaraan: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await MasterKendaraan.deleteMasterKendaraanService({
        id: _id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = MasterKendaraanController;
