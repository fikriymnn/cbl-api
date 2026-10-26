const InvoiceApService = require("./service/invoiceApService");
const InvoiceApPaymentService = require("./service/invoiceApPaymentService");

const sendError = (res, error) =>
  res.status(error.status_code || 500).json({
    success: false,
    status_code: error.status_code || 500,
    msg: error.message,
    data: error.data,
  });

const InvoiceApController = {
  getInvoiceApPayment: async (req, res) => {
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      vendor_id,
      status,
      is_tax,
    } = req.query;

    try {
      const getData = await InvoiceApPaymentService.getInvoiceApPaymentService(
        {
          id: req.params.id,
          page,
          limit,
          start_date,
          end_date,
          search,
          vendor_id,
          status,
          is_tax,
        },
      );
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getNoInvoiceApPayment: async (req, res) => {
    try {
      const getData =
        await InvoiceApPaymentService.getNoInvoiceApPaymentService({
          payment_date: req.query.payment_date,
        });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createInvoiceApPayment: async (req, res) => {
    const {
      vendor_id,
      receipt_number,
      is_tax,
      payment_amount,
      payment_proof,
      payment_date,
      payment_method,
      bank,
      account_number,
      note,
      invoices,
    } = req.body;

    try {
      const getData =
        await InvoiceApPaymentService.createInvoiceApPaymentService({
          vendor_id,
          created_by: req.user.id,
          receipt_number,
          is_tax,
          payment_amount,
          payment_proof,
          payment_date,
          payment_method,
          bank,
          account_number,
          note,
          invoices,
        });
      return res.status(getData.status).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  approveInvoiceApPayment: async (req, res) => {
    try {
      const getData =
        await InvoiceApPaymentService.approveInvoiceApPaymentService({
          id: req.params.id,
          id_approve: req.user.id,
        });
      return res.status(getData.status).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  getAccountPayable: async (req, res) => {
    const { start_date, end_date, search, id_vendor, waktu } = req.query;

    try {
      const getData = await InvoiceApService.getAccountPayableService({
        start_date,
        end_date,
        search,
        id_vendor,
        waktu,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getInvoiceApRecapByVendor: async (req, res) => {
    const { start_date, end_date, id_vendor, search } = req.query;

    try {
      const getData = await InvoiceApService.getInvoiceApRecapByVendorService({
        start_date,
        end_date,
        id_vendor,
        search,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  },

  getInvoiceAp: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      start_date_faktur,
      end_date_faktur,
      start_date_jatuh_tempo,
      end_date_jatuh_tempo,
      search,
      id_vendor,
      status,
      status_proses,
      status_payment,
      waktu,
    } = req.query;

    try {
      const getData = await InvoiceApService.getInvoiceApService({
        id: _id,
        page,
        limit,
        start_date,
        end_date,
        start_date_faktur,
        end_date_faktur,
        start_date_jatuh_tempo,
        end_date_jatuh_tempo,
        search,
        id_vendor,
        status,
        status_proses,
        status_payment,
        waktu,
      });
      return res.status(getData.status || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getNoInvoiceAp: async (req, res) => {
    const { tgl_faktur } = req.query;

    try {
      const getData = await InvoiceApService.getNoInvoiceApService({
        tgl_faktur,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createInvoiceAp: async (req, res) => {
    const {
      id_vendor,
      nama_vendor,
      no_invoice,
      no_invoice_vendor,
      no_po,
      no_surat_jalan,
      alamat,
      tgl_faktur,
      tgl_jatuh_tempo,
      waktu_jatuh_tempo,
      sub_total,
      dpp,
      diskon,
      ppn,
      total,
      dp,
      balance_due,
      note,
      is_show_dpp,
      is_tax,
      invoice_ap_item,
    } = req.body;

    try {
      const getData = await InvoiceApService.createInvoiceApService({
        id_vendor,
        id_create: req.user.id,
        nama_vendor,
        no_invoice,
        no_invoice_vendor,
        no_po,
        no_surat_jalan,
        alamat,
        tgl_faktur,
        tgl_jatuh_tempo,
        waktu_jatuh_tempo,
        sub_total,
        dpp,
        diskon,
        ppn,
        total,
        dp,
        balance_due,
        note,
        is_show_dpp,
        is_tax,
        invoice_ap_item,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  updateInvoiceAp: async (req, res) => {
    const _id = req.params.id;
    const {
      nama_vendor,
      no_invoice,
      no_invoice_vendor,
      no_po,
      no_surat_jalan,
      alamat,
      tgl_faktur,
      tgl_jatuh_tempo,
      waktu_jatuh_tempo,
      sub_total,
      dpp,
      diskon,
      ppn,
      total,
      dp,
      balance_due,
      note,
      is_show_dpp,
      is_tax,
      invoice_ap_item,
    } = req.body;

    try {
      const getData = await InvoiceApService.updateInvoiceApService({
        id: _id,
        nama_vendor,
        no_invoice,
        no_invoice_vendor,
        no_po,
        no_surat_jalan,
        alamat,
        tgl_faktur,
        tgl_jatuh_tempo,
        waktu_jatuh_tempo,
        sub_total,
        dpp,
        diskon,
        ppn,
        total,
        dp,
        balance_due,
        note,
        is_show_dpp,
        is_tax,
        invoice_ap_item,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  requestInvoiceAp: async (req, res) => {
    try {
      const getData = await InvoiceApService.requestInvoiceApService({
        id: req.params.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  approveInvoiceAp: async (req, res) => {
    try {
      const getData = await InvoiceApService.approveInvoiceApService({
        id: req.params.id,
        id_approve: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  requestInvoiceApBulk: async (req, res) => {
    try {
      const getData = await InvoiceApService.requestInvoiceApBulkService({
        ids: req.body.ids,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  approveInvoiceApBulk: async (req, res) => {
    try {
      const getData = await InvoiceApService.approveInvoiceApBulkService({
        ids: req.body.ids,
        id_approve: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  rejectInvoiceAp: async (req, res) => {
    try {
      const getData = await InvoiceApService.rejectInvoiceApService({
        id: req.params.id,
        id_reject: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  deleteInvoiceAp: async (req, res) => {
    try {
      const getData = await InvoiceApService.deleteInvoiceApService({
        id: req.params.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },
};

module.exports = InvoiceApController;
