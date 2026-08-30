const OutstandingStockRawMaterialService = require("./service/outstandingStockRawMaterialService");

const OutstandingStockRawMaterialController = {
  getOutstandingStockRawMaterial: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_item,
      tipe_barang,
      status,
      status_ticket,
    } = req.query;

    try {
      const getData =
        await OutstandingStockRawMaterialService.getOutstandingStockRawMaterialService(
          {
            id: _id,
            page,
            limit,
            start_date,
            end_date,
            search,
            id_item,
            tipe_barang,
            status,
            status_ticket,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  // body: { id_jo, id_so, id_io, id_bom_ppic, id_item, no_jo, no_bom_ppic, no_so, no_io, customer, produk, nama_item, qty, tipe_barang, satuan, rencana_cetak }
  createOutstandingStockRawMaterial: async (req, res) => {
    const {
      id_jo,
      id_so,
      id_io,
      id_bom_ppic,
      id_item,
      no_jo,
      no_bom_ppic,
      no_so,
      no_io,
      customer,
      produk,
      nama_item,
      qty,
      tipe_barang,
      satuan,
      rencana_cetak,
    } = req.body;

    try {
      const getData =
        await OutstandingStockRawMaterialService.createOutstandingStockRawMaterialService(
          {
            id_jo,
            id_so,
            id_io,
            id_bom_ppic,
            id_item,
            no_jo,
            no_bom_ppic,
            no_so,
            no_io,
            customer,
            produk,
            nama_item,
            qty,
            tipe_barang,
            satuan,
            rencana_cetak,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  // params: id
  approveOutstandingStockRawMaterial: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await OutstandingStockRawMaterialService.approveOutstandingStockRawMaterialService(
          {
            id: _id,
            id_user: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = OutstandingStockRawMaterialController;
