const AdjustStockRawMaterialStockService = require("./service/adjustStockGudangStockService");

const AdjustStockRawMaterialStockController = {
  getAdjustStockRawMaterialStock: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_gudang_raw_material_stock,
      id_item,
    } = req.query;

    try {
      const getData =
        await AdjustStockRawMaterialStockService.getAdjustStockRawMaterialStockService(
          {
            id: _id,
            page: page,
            limit: limit,
            start_date: start_date,
            end_date: end_date,
            search: search,
            id_gudang_raw_material_stock: id_gudang_raw_material_stock,
            id_item: id_item,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createAdjustStockRawMaterialStock: async (req, res) => {
    const {
      id_gudang_raw_material_stock,
      jumlah_qty_awal,
      jumlah_qty_adjust,
      note,
    } = req.body;

    try {
      const getData =
        await AdjustStockRawMaterialStockService.createAdjustStockRawMaterialStockService(
          {
            id_gudang_raw_material_stock: id_gudang_raw_material_stock,
            jumlah_qty_awal: jumlah_qty_awal,
            jumlah_qty_adjust: jumlah_qty_adjust,
            note: note,
            id_user: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateAdjustStockRawMaterialStock: async (req, res) => {
    const _id = req.params.id;
    const { jumlah_qty_awal, jumlah_qty_adjust, note } = req.body;

    try {
      const getData =
        await AdjustStockRawMaterialStockService.updateAdjustStockRawMaterialStockService(
          {
            id: _id,
            jumlah_qty_awal: jumlah_qty_awal,
            jumlah_qty_adjust: jumlah_qty_adjust,
            note: note,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = AdjustStockRawMaterialStockController;
