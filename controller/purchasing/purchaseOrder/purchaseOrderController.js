const PurchaseOrderService = require("./service/purchaseOrderService");

const PurchaseOrderController = {
  getPurchaseOrder: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date_po,
      end_date_po,
      start_date_kirim,
      end_date_kirim,
      search,
      id_jo,
      id_io,
      id_so,
      id_vendor,
      id_bom_ppic,
      status,
      status_tiket,
      status_po,
    } = req.query;

    try {
      const getData = await PurchaseOrderService.getPurchaseOrderService({
        id: _id,
        page,
        limit,
        start_date_po,
        end_date_po,
        start_date_kirim,
        end_date_kirim,
        search,
        id_jo,
        id_io,
        id_so,
        id_vendor,
        id_bom_ppic,
        status,
        status_tiket,
        status_po,
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
      purchase_name,
      items,
      items_jo,
      request_purchase_data,
    } = req.body;

    try {
      console.log("req.body", req.body);
      const getData = await PurchaseOrderService.createPurchaseOrderService({
        id_create: req.user.id,
        id_vendor,
        nama_vendor,
        tgl_po,
        tgl_kirim,
        discount,
        note_internal,
        note_supplier,
        purchase_name,
        items,
        items_jo,
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
      purchase_name,
      items,
      items_jo,
    } = req.body;

    try {
      console.log("id", _id);

      const getData = await PurchaseOrderService.updatePurchaseOrderService({
        id: _id,
        id_vendor,
        nama_vendor,
        tgl_po,
        tgl_kirim,
        discount,
        note_internal,
        note_supplier,
        purchase_name,
        items,
        items_jo,
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
  closePurchaseOrder: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await PurchaseOrderService.closePurchaseOrderService({
        id: _id,
        id_close_po: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  sendBackToRequest: async (req, res) => {
    const _id = req.params.idItemJo;
    const { id_item, id_brand, nama_item, nama_brand, qty_sendback } = req.body;

    try {
      const getData = await PurchaseOrderService.sendBackToRequestService({
        id_item_jo: _id,
        id_brand: id_brand,
        id_item: id_item,
        nama_item: nama_item,
        nama_brand: nama_brand,
        qty_sendback: qty_sendback,
        id_user_sendback: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PurchaseOrderController;
