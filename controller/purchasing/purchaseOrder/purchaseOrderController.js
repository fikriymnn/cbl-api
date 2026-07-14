const PurchaseOrderService = require("./service/purchaseOrderService");

const PurchaseOrderController = {
  getPurchaseOrder: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_jo,
      id_io,
      id_so,
      id_bom_ppic,
      status,
      status_tiket,
    } = req.query;

    try {
      const getData = await PurchaseOrderService.getPurchaseOrderService({
        id: _id,
        page,
        limit,
        start_date,
        end_date,
        search,
        id_jo,
        id_io,
        id_so,
        id_bom_ppic,
        status,
        status_tiket,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getNoPurchaseOrder: async (req, res) => {
    try {
      const getData = await PurchaseOrderService.getNoPurchaseOrderService();
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createPurchaseOrder: async (req, res) => {
    const {
      id_vendor,
      nama_vendor,
      tgl_po,
      tgl_kirim,
      discount,
      note_internal,
      note_supplier,
      items,
      request_purchase_data,
    } = req.body;

    try {
      const getData = await PurchaseOrderService.createPurchaseOrderService({
        id_create: req.user.id,
        id_vendor,
        nama_vendor,
        tgl_po,
        tgl_kirim,
        discount,
        note_internal,
        note_supplier,
        items,
        request_purchase_data,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updatePurchaseOrder: async (req, res) => {
    const _id = req.params.id;
    const {
      id_vendor,
      nama_vendor,
      tgl_po,
      tgl_kirim,
      discount,
      note_internal,
      note_supplier,
      items,
    } = req.body;

    try {
      const getData = await PurchaseOrderService.updatePurchaseOrderService({
        id: _id,
        id_vendor,
        nama_vendor,
        tgl_po,
        tgl_kirim,
        discount,
        note_internal,
        note_supplier,
        items,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  requestPurchaseOrder: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await PurchaseOrderService.requestPurchaseOrderService({
        id: _id,
        id_request: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveKabagPurchaseOrder: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderService.approveKabagPurchaseOrderService({
          id: _id,
          id_approve_kabag: req.user.id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveFinancePurchaseOrder: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderService.approveFinancePurchaseOrderService({
          id: _id,
          id_approve_finance: req.user.id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectKabagPurchaseOrder: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderService.rejectKabagPurchaseOrderService({
          id: _id,
          id_reject_kabag: req.user.id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectFinancePurchaseOrder: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderService.rejectFinancePurchaseOrderService({
          id: _id,
          id_reject_finance: req.user.id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PurchaseOrderController;
