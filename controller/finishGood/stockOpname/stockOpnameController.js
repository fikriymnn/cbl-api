const StockOpnameService = require("./service/stockOpnameService");

const StockOpnameController = {
  getStockOpname: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, search, status } = req.query;

    try {
      const getData = await StockOpnameService.getStockOpnameService({
        id: _id,
        page,
        limit,
        start_date,
        end_date,
        search,
        status,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createStockOpname: async (req, res) => {
    const { period_from, period_to } = req.body;

    try {
      const getData = await StockOpnameService.createStockOpnameService({
        period_from,
        period_to,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  saveStockOpnameItem: async (req, res) => {
    const _id = req.params.id;
    const { jumlah_qty_real, note } = req.body;

    try {
      const getData = await StockOpnameService.saveStockOpnameItemService({
        id: _id,
        jumlah_qty_real,
        note,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveStockOpnameItem: async (req, res) => {
    const { id_list, note_approve } = req.body;

    try {
      const getData = await StockOpnameService.approveStockOpnameItemService({
        id_list: id_list,
        note_approve: note_approve,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectStockOpnameItem: async (req, res) => {
    const { id_list, note_reject } = req.body;

    try {
      const getData = await StockOpnameService.rejectStockOpnameItemService({
        id_list: id_list,
        note_reject: note_reject,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  requestStockOpname: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await StockOpnameService.requestStockOpnameService({
        id: _id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveStockOpname: async (req, res) => {
    const _id = req.params.id;
    const { tgl_mutasi } = req.body;

    try {
      const getData = await StockOpnameService.approveStockOpnameService({
        id: _id,
        id_user: req.user.id,
        tgl_mutasi: tgl_mutasi || new Date(),
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectStockOpname: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await StockOpnameService.rejectStockOpnameService({
        id: _id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateStockOpnameItem: async (req, res) => {
    const _id = req.params.id;
    const { jumlah_qty_real, note } = req.body;

    try {
      const getData = await StockOpnameService.updateStockOpnameItemService({
        id: _id,
        jumlah_qty_real,
        note,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = StockOpnameController;
