const RequestCancelPurchaseOrderService = require("./service/requestCancelPurchaseOrderService");

const RequestCancelPurchaseOrderController = {
  getRequestCancelPurchaseOrder: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_purchase_order,
      status,
      status_ticket,
    } = req.query;

    try {
      const getData =
        await RequestCancelPurchaseOrderService.getRequestCancelPurchaseOrderService(
          {
            id: _id,
            page,
            limit,
            start_date,
            end_date,
            search,
            id_purchase_order,
            status,
            status_ticket,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createRequestCancelPurchaseOrder: async (req, res) => {
    const { id_purchase_order, note } = req.body;

    try {
      const getData =
        await RequestCancelPurchaseOrderService.createRequestCancelPurchaseOrderService(
          {
            id_purchase_order,
            note,
            id_request: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveRequestCancelPurchaseOrder: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await RequestCancelPurchaseOrderService.approveRequestCancelPurchaseOrderService(
          {
            id: _id,
            id_respon: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectRequestCancelPurchaseOrder: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await RequestCancelPurchaseOrderService.rejectRequestCancelPurchaseOrderService(
          {
            id: _id,
            id_respon: req.user.id,
          },
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = RequestCancelPurchaseOrderController;
