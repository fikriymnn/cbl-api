const { Op, Sequelize, where } = require("sequelize");
const PembuatanStandarWarnaService = require("./service/pembuatanSetandarWarnaService");

const PembuatanStandarWarnaController = {
  getPembuatanStandarWarna: async (req, res) => {
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
        await PembuatanStandarWarnaService.getPembuatanStandarWarnaService({
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
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: error.message });
    }
  },

  ApprovePembuatanStandarWarna: async (req, res) => {
    const _id = req.params.id;

    try {
      const kirimData =
        await PembuatanStandarWarnaService.approvePembuatanStandarWarnaService({
          id: _id,
          id_user: req.user.id,
        });
      return res.status(200).json(kirimData);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: error.message });
    }
  },

  rejectPembuatanStandarWarna: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;
    try {
      const kirimData =
        await PembuatanStandarWarnaService.rejectPembuatanStandarWarnaService({
          id: _id,
          note: note,
          id_user: req.user.id,
        });
      return res.status(200).json(kirimData);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, status_code: 500, msg: error.message });
    }
  },
};

module.exports = PembuatanStandarWarnaController;
