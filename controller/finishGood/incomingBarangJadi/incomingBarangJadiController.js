const { Op, Sequelize, where } = require("sequelize");
const IncomingBarangJadiService = require("./service/incomingBarangJadiService");

const IncomingBarangJadiController = {
  getIncomingBarangJadi: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      search,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
    } = req.query;

    try {
      const getData =
        await IncomingBarangJadiService.getIncomingBarangJadiService({
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          status: status,
          search: search,
          id_jo: id_jo,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  approveIncomingBarangJadi: async (req, res) => {
    const _id = req.params.id;
    const { note_user } = req.body;

    try {
      const getData =
        await IncomingBarangJadiService.approveIncomingBarangJadiService({
          id: _id,
          id_user: req.user.id,
          note_user: note_user,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectIncomingBarangJadi: async (req, res) => {
    const _id = req.params.id;
    const { note_user } = req.body;

    try {
      const getData =
        await IncomingBarangJadiService.rejectIncomingBarangJadiService({
          id: _id,
          id_user: req.user.id,
          note_user: note_user,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = IncomingBarangJadiController;
