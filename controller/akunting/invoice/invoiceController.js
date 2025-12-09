const { Op, Sequelize, where } = require("sequelize");
const InvoiceService = require("./service/invoiceService");

const InvoiceController = {
  getInvoice: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_customer,
      status,
      status_proses,
    } = req.query;

    try {
      const getData = await InvoiceService.getInvoiceService({
        id: _id,
        page: page,
        limit: limit,
        start_date: start_date,
        end_date: end_date,
        search: search,
        id_customer: id_customer,
        status: status,
        status_proses: status_proses,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getNoInvoice: async (req, res) => {
    try {
      const getData = await InvoiceService.getNoInvoiceService();
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createInvoice: async (req, res) => {
    const {
      id_customer,
      nama_customer,
      no_po,
      no_invoice,
      tgl_po,
      no_do,
      tgl_kirim,
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
      invoice_produk,
    } = req.body;

    try {
      const getData = await InvoiceService.creteInvoiceService({
        id_customer: id_customer,
        id_create: req.user.id,
        nama_customer: nama_customer,
        no_po: no_po,
        no_invoice: no_invoice,
        tgl_po: tgl_po,
        no_do: no_do,
        tgl_kirim: tgl_kirim,
        alamat: alamat,
        tgl_faktur: tgl_faktur,
        tgl_jatuh_tempo: tgl_jatuh_tempo,
        waktu_jatuh_tempo: waktu_jatuh_tempo,
        sub_total: sub_total,
        dpp: dpp,
        diskon: diskon,
        ppn: ppn,
        total: total,
        dp: dp,
        balance_due: balance_due,
        note: note,
        is_show_dpp: is_show_dpp,
        invoice_produk: invoice_produk,
        note: note,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateInvoice: async (req, res) => {
    const _id = req.params.id;
    const {
      id_customer,
      nama_customer,
      no_po,
      no_invoice,
      tgl_po,
      no_do,
      tgl_kirim,
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
      invoice_produk,
    } = req.body;

    try {
      const getData = await InvoiceService.updateInvoiceService({
        id: _id,
        id_customer: id_customer,
        id_create: req.user.id,
        nama_customer: nama_customer,
        no_po: no_po,
        no_invoice: no_invoice,
        tgl_po: tgl_po,
        no_do: no_do,
        tgl_kirim: tgl_kirim,
        alamat: alamat,
        tgl_faktur: tgl_faktur,
        tgl_jatuh_tempo: tgl_jatuh_tempo,
        waktu_jatuh_tempo: waktu_jatuh_tempo,
        sub_total: sub_total,
        dpp: dpp,
        diskon: diskon,
        ppn: ppn,
        total: total,
        dp: dp,
        balance_due: balance_due,
        note: note,
        is_show_dpp: is_show_dpp,
        invoice_produk: invoice_produk,
        note: note,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  requestInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await InvoiceService.requestInvoiceService({
        id: _id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await InvoiceService.approveInvoiceService({
        id: _id,
        id_approve: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  rejectInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await InvoiceService.rejectInvoiceService({
        id: _id,
        id_reject: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await InvoiceService.deleteInvoiceService({
        id: _id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = InvoiceController;
