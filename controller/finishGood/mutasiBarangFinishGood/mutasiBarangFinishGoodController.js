const { Op, Sequelize, where } = require("sequelize");
const MutasiBarangFinishGoodService = require("./service/mutasiBarangFinishGoodService");

const MutasiBarangFinishGoodController = {
  getMutasiBarangFinishGood: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
    } = req.query;

    try {
      const getData =
        await MutasiBarangFinishGoodService.getMutasiBarangFinishGoodService({
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
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

  getMutasiBarangFinishGoodByJo: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, search } = req.query;

    try {
      const getData =
        await MutasiBarangFinishGoodService.getMutasiBarangFinishGoodByJo({
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
};

module.exports = MutasiBarangFinishGoodController;
