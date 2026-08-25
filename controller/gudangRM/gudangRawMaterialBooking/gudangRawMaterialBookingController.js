const GudangRawMaterialBookingService = require("./service/gudangRawMaterialBookingService");

const GudangRawMaterialBookingController = {
  getGudangRawMaterialBooking: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_jo,
      id_item,
      tipe_barang,
      status,
    } = req.query;

    try {
      const getData =
        await GudangRawMaterialBookingService.getGudangRawMaterialBookingService(
          {
            id: _id,
            page,
            limit,
            start_date,
            end_date,
            search,
            id_jo,
            id_item,
            tipe_barang,
            status,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  // body: { id_jo, id_item, qty, rencana_cetak, customer, produk }
  createGudangRawMaterialBooking: async (req, res) => {
    const { id_jo, id_item, qty, rencana_cetak, customer, produk } = req.body;

    try {
      const getData =
        await GudangRawMaterialBookingService.createGudangRawMaterialBookingService(
          {
            id_jo,
            id_item,
            qty,
            rencana_cetak,
            customer,
            produk,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveGudangRawMaterialBooking: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await GudangRawMaterialBookingService.approveGudangRawMaterialBookingService(
          {
            id: _id,
            id_user_approve: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = GudangRawMaterialBookingController;
