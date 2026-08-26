const GudangRawMaterialStockService = require("./service/gudangRawMaterialStockService");

const GudangRawMaterialStockController = {
  getGudangRawMaterialStock: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, search, id_item, tipe_barang } =
      req.query;

    try {
      const getData =
        await GudangRawMaterialStockService.getGudangRawMaterialStockService({
          id: _id,
          page,
          limit,
          start_date,
          end_date,
          search,
          id_item,
          tipe_barang,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  // body: { id_item, qty, tipe_barang, satuan }
  createGudangRawMaterialStock: async (req, res) => {
    const { id_item, qty, tipe_barang, satuan, sumber_mutasi } = req.body;

    try {
      const getData =
        await GudangRawMaterialStockService.createGudangRawMaterialStockService(
          {
            id_item,
            qty,
            tipe_barang,
            satuan,
            id_user: req.user.id,
            sumber_mutasi: sumber_mutasi,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = GudangRawMaterialStockController;
