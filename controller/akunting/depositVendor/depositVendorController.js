const DepositVendorService = require("./service/depositVendorService");

const sendError = (res, error) =>
  res.status(error.status_code || 500).json({
    success: false,
    status_code: error.status_code || 500,
    msg: error.message,
  });

const DepositVendorController = {
  getDepositVendor: async (req, res) => {
    const { page, limit, start_date, end_date, search, id_vendor, status } =
      req.query;

    try {
      const getData = await DepositVendorService.getDepositVendorService({
        id: req.params.id,
        page,
        limit,
        start_date,
        end_date,
        search,
        id_vendor,
        status,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getSaldoVendor: async (req, res) => {
    const { id_vendor } = req.query;

    try {
      const getData = await DepositVendorService.getSaldoVendorService({
        id_vendor,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getNoDepositVendor: async (req, res) => {
    try {
      const getData = await DepositVendorService.getNoDepositVendorService();
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createDepositVendor: async (req, res) => {
    const {
      id_vendor,
      no_deposit,
      cara_bayar,
      billing_address,
      tgl_faktur,
      nominal,
      note,
    } = req.body;

    try {
      const getData = await DepositVendorService.createDepositVendorService({
        id_vendor,
        id_create: req.user.id,
        no_deposit,
        cara_bayar,
        billing_address,
        tgl_faktur,
        nominal,
        note,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  updateDepositVendor: async (req, res) => {
    const {
      id_vendor,
      no_deposit,
      cara_bayar,
      billing_address,
      tgl_faktur,
      nominal,
      note,
    } = req.body;

    try {
      const getData = await DepositVendorService.updateDepositVendorService({
        id: req.params.id,
        id_vendor,
        no_deposit,
        cara_bayar,
        billing_address,
        tgl_faktur,
        nominal,
        note,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  requestDepositVendor: async (req, res) => {
    try {
      const getData = await DepositVendorService.requestDepositVendorService({
        id: req.params.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  approveDepositVendor: async (req, res) => {
    try {
      const getData = await DepositVendorService.approveDepositVendorService({
        id: req.params.id,
        id_approve: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  rejectDepositVendor: async (req, res) => {
    try {
      const getData = await DepositVendorService.rejectDepositVendorService({
        id: req.params.id,
        id_reject: req.user.id,
        note_reject: req.body.note_reject,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  deleteDepositVendor: async (req, res) => {
    try {
      const getData = await DepositVendorService.deleteDepositVendorService({
        id: req.params.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },
};

module.exports = DepositVendorController;
