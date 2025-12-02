const { Op, Sequelize, where } = require("sequelize");
const ProduksiJoDoneService = require("./service/produksiJoDoneService");

const ProduksiJoDoneController = {
  getProduksiJoDone: async (req, res) => {
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
      const getData = await ProduksiJoDoneService.getProduksiJoDoneService({
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

  KirimProduksiJoDone: async (req, res) => {
    const _id = req.params.id;
    const { qty_kirim, is_jo_done } = req.body;

    try {
      const kirimData = await ProduksiJoDoneService.kirimProduksiJoDoneService({
        id: _id,
        qty_kirim: qty_kirim,
        is_jo_done: is_jo_done,
        id_user: req.user.id,
      });
      return res.status(200).json(kirimData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = ProduksiJoDoneController;
