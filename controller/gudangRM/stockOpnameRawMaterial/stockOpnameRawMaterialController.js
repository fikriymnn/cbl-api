// controller/stockOpnameRawMaterialController.js
const StockOpnameRawMaterialService = require("./service/stockOpnameRawMaterialService");

const StockOpnameRawMaterialController = {
  getStockOpnameRawMaterial: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, search, status } = req.query;

    try {
      const getData =
        await StockOpnameRawMaterialService.getStockOpnameRawMaterialService({
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

  createStockOpnameRawMaterial: async (req, res) => {
    const { period } = req.body;

    try {
      const getData =
        await StockOpnameRawMaterialService.createStockOpnameRawMaterialService(
          {
            period,
            id_user: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  saveStockOpnameRawMaterialItem: async (req, res) => {
    const _id = req.params.id;
    const { jumlah_qty_real, note } = req.body;

    try {
      const getData =
        await StockOpnameRawMaterialService.saveStockOpnameRawMaterialItemService(
          {
            id: _id,
            jumlah_qty_real,
            note,
            id_user: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveStockOpnameRawMaterialItem: async (req, res) => {
    const { id_list, note_approve } = req.body;

    try {
      const getData =
        await StockOpnameRawMaterialService.approveStockOpnameRawMaterialItemService(
          {
            id_list: id_list,
            note_approve: note_approve,
            id_user: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectStockOpnameRawMaterialItem: async (req, res) => {
    const { id_list, note_reject } = req.body;

    try {
      const getData =
        await StockOpnameRawMaterialService.rejectStockOpnameRawMaterialItemService(
          {
            id_list: id_list,
            note_reject: note_reject,
            id_user: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  requestStockOpnameRawMaterial: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await StockOpnameRawMaterialService.requestStockOpnameRawMaterialService(
          {
            id: _id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveStockOpnameRawMaterial: async (req, res) => {
    const _id = req.params.id;
    const { tgl_mutasi } = req.body;
    try {
      const getData =
        await StockOpnameRawMaterialService.approveStockOpnameRawMaterialService(
          {
            id: _id,
            id_user: req.user.id,
            tgl_mutasi: tgl_mutasi,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectStockOpnameRawMaterial: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await StockOpnameRawMaterialService.rejectStockOpnameRawMaterialService(
          {
            id: _id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateStockOpnameRawMaterialItem: async (req, res) => {
    const _id = req.params.id;
    const { jumlah_qty_real, note } = req.body;

    try {
      const getData =
        await StockOpnameRawMaterialService.updateStockOpnameRawMaterialItemService(
          {
            id: _id,
            jumlah_qty_real,
            note,
            id_user: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = StockOpnameRawMaterialController;
