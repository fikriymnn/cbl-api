const AdjustStockService = require("./service/adjustStockService");

const AdjustStockController = {
  getAdjustStock: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_gudang_finish_good,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
    } = req.query;

    try {
      const getData = await AdjustStockService.getAdjustStockService({
        id: _id,
        page: page,
        limit: limit,
        start_date: start_date,
        end_date: end_date,
        search: search,
        id_gudang_finish_good: id_gudang_finish_good,
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

  createAdjustStock: async (req, res) => {
    const { id_gudang_finish_good, jumlah_qty_awal, jumlah_qty_adjust, note } =
      req.body;

    try {
      const getData = await AdjustStockService.createAdjustStockService({
        id_gudang_finish_good: id_gudang_finish_good,
        jumlah_qty_awal: jumlah_qty_awal,
        jumlah_qty_adjust: jumlah_qty_adjust,
        note: note,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateAdjustStock: async (req, res) => {
    const _id = req.params.id;
    const { jumlah_qty_awal, jumlah_qty_adjust, note } = req.body;

    try {
      const getData = await AdjustStockService.updateAdjustStockService({
        id: _id,
        jumlah_qty_awal: jumlah_qty_awal,
        jumlah_qty_adjust: jumlah_qty_adjust,
        note: note,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = AdjustStockController;
