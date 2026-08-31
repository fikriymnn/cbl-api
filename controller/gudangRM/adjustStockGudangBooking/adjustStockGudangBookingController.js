const AdjustStockRawMaterialBookingService = require("./service/adjustStockGudangBookingService");

const AdjustStockRawMaterialBookingController = {
  getAdjustStockRawMaterialBooking: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_gudang_raw_material_booking,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
      id_item,
    } = req.query;

    try {
      const getData =
        await AdjustStockRawMaterialBookingService.getAdjustStockRawMaterialBookingService(
          {
            id: _id,
            page: page,
            limit: limit,
            start_date: start_date,
            end_date: end_date,
            search: search,
            id_gudang_raw_material_booking: id_gudang_raw_material_booking,
            id_jo: id_jo,
            id_io: id_io,
            id_so: id_so,
            id_customer: id_customer,
            id_produk: id_produk,
            id_item: id_item,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createAdjustStockRawMaterialBooking: async (req, res) => {
    const {
      id_gudang_raw_material_booking,
      jumlah_qty_awal,
      jumlah_qty_adjust,
      note,
    } = req.body;

    try {
      const getData =
        await AdjustStockRawMaterialBookingService.createAdjustStockRawMaterialBookingService(
          {
            id_gudang_raw_material_booking: id_gudang_raw_material_booking,
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

  updateAdjustStockRawMaterialBooking: async (req, res) => {
    const _id = req.params.id;
    const { jumlah_qty_awal, jumlah_qty_adjust, note } = req.body;

    try {
      const getData =
        await AdjustStockRawMaterialBookingService.updateAdjustStockRawMaterialBookingService(
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

module.exports = AdjustStockRawMaterialBookingController;
