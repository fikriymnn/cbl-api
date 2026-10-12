const PurchaseOrderBookingService = require("./service/purchaseOrderBookingService");

const PurchaseOrderBookingController = {
  getPurchaseOrderBooking: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date_po,
      end_date_po,
      start_date_kirim,
      end_date_kirim,
      search,
      id_vendor,
      status,
      status_tiket,
      status_po,
      sort_by,
      sort_order,
    } = req.query;

    try {
      const getData =
        await PurchaseOrderBookingService.getPurchaseOrderBookingService({
          id: _id,
          page,
          limit,
          start_date_po,
          end_date_po,
          start_date_kirim,
          end_date_kirim,
          search,
          id_vendor,
          status,
          status_tiket,
          status_po,
          sort_by,
          sort_order,
        });
      return res.status(getData.status || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getNoPurchaseOrderBooking: async (req, res) => {
    try {
      const getData =
        await PurchaseOrderBookingService.getNoPurchaseOrderBookingService();
      return res.status(getData.status || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createPurchaseOrderBooking: async (req, res) => {
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
    } = req.body;

    try {
      const getData =
        await PurchaseOrderBookingService.createPurchaseOrderBookingService({
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
        });
      return res.status(getData.status_code || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updatePurchaseOrderBooking: async (req, res) => {
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
    } = req.body;

    try {
      const getData =
        await PurchaseOrderBookingService.updatePurchaseOrderBookingService({
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
        });
      return res.status(getData.status_code || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  requestPurchaseOrderBooking: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderBookingService.requestPurchaseOrderBookingService({
          id: _id,
          id_request: req.user.id,
        });
      return res.status(getData.status_code || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveKabagPurchaseOrderBooking: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderBookingService.approveKabagPurchaseOrderBookingService(
          {
            id: _id,
            id_approve_kabag: req.user.id,
          },
        );
      return res.status(getData.status_code || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveFinancePurchaseOrderBooking: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderBookingService.approveFinancePurchaseOrderBookingService(
          {
            id: _id,
            id_approve_finance: req.user.id,
          },
        );
      return res.status(getData.status_code || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectKabagPurchaseOrderBooking: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderBookingService.rejectKabagPurchaseOrderBookingService(
          {
            id: _id,
            id_reject_kabag: req.user.id,
          },
        );
      return res.status(getData.status_code || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectFinancePurchaseOrderBooking: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderBookingService.rejectFinancePurchaseOrderBookingService(
          {
            id: _id,
            id_reject_finance: req.user.id,
          },
        );
      return res.status(getData.status_code || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  closePurchaseOrderBooking: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PurchaseOrderBookingService.closePurchaseOrderBookingService({
          id: _id,
          id_close_po: req.user.id,
        });
      return res.status(getData.status_code || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PurchaseOrderBookingController;
