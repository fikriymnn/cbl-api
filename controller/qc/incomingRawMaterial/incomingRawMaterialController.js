const IncomingRawMaterialService = require("./service/incomingRawMaterialService");

const IncomingRawMaterialController = {
  getIncomingRawMaterial: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_purchase_order,
      id_purchase_order_item_jo,
      status,
      status_ticket,
    } = req.query;

    try {
      const getData =
        await IncomingRawMaterialService.getIncomingRawMaterialService({
          id: _id,
          page,
          limit,
          start_date,
          end_date,
          search,
          id_purchase_order,
          id_purchase_order_item_jo,
          status,
          status_ticket,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getnoSuratJalan: async (req, res) => {
    try {
      const getData = await IncomingRawMaterialService.getNoSuratJalanService();
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  // body: { items: [{ id_purchase_order, id_purchase_order_item_jo, no_surat_jalan, qty_incoming, qty_idle, qty_pallet }, ...] }
  createIncomingRawMaterial: async (req, res) => {
    const { items } = req.body;

    try {
      const getData =
        await IncomingRawMaterialService.createIncomingRawMaterialService({
          items,
          id_request: req.user.id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveIncomingRawMaterial: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const getData =
        await IncomingRawMaterialService.approveIncomingRawMaterialService({
          id: _id,
          id_approve: req.user.id,
          note: note,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectIncomingRawMaterial: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;
    try {
      const getData =
        await IncomingRawMaterialService.rejectIncomingRawMaterialService({
          id: _id,
          id_reject: req.user.id,
          note: note,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = IncomingRawMaterialController;
