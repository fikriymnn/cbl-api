const { Op, Sequelize, where } = require("sequelize");
const PerubahanInvoiceService = require("./service/perubahanInvoiceService");

const PerubahanInvoiceController = {
  getPerubahanInvoice: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_customer,
      id_invoice,
      status,
      status_proses,
    } = req.query;

    try {
      const getData = await PerubahanInvoiceService.getPerubahanInvoiceService({
        id: _id,
        page: page,
        limit: limit,
        start_date: start_date,
        end_date: end_date,
        search: search,
        id_customer: id_customer,
        id_invoice: id_invoice,
        status: status,
        status_proses: status_proses,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getNoPerubahanInvoice: async (req, res) => {
    try {
      const getData =
        await PerubahanInvoiceService.getNoPerubahanInvoiceService();
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createPerubahanInvoice: async (req, res) => {
    const {
      id_invoice,
      id_customer,
      nama_customer,
      no_perubahan_invoice,
      no_po,
      no_invoice,
      tgl_invoice,
      alamat,
      tgl_faktur,
      new_alamat,
      new_tgl_faktur,
      note,
      file,
      perubahan_invoice_produk,
    } = req.body;

    try {
      const getData =
        await PerubahanInvoiceService.cretePerubahanInvoiceService({
          id_invoice: id_invoice,
          id_customer: id_customer,
          id_create: req.user.id,
          nama_customer: nama_customer,
          no_perubahan_invoice: no_perubahan_invoice,
          no_po: no_po,
          no_invoice: no_invoice,
          tgl_invoice: tgl_invoice,
          alamat: alamat,
          tgl_faktur: tgl_faktur,
          new_alamat: new_alamat,
          new_tgl_faktur: new_tgl_faktur,
          note: note,
          file: file,
          perubahan_invoice_produk: perubahan_invoice_produk,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updatePerubahanInvoice: async (req, res) => {
    const _id = req.params.id;
    const {
      id_invoice,
      id_customer,
      nama_customer,
      no_perubahan_invoice,
      no_po,
      no_invoice,
      tgl_invoice,
      alamat,
      tgl_faktur,
      new_alamat,
      new_tgl_faktur,
      note,
      file,
      perubahan_invoice_produk,
    } = req.body;

    try {
      const getData =
        await PerubahanInvoiceService.updatePerubahanInvoiceService({
          id: _id,
          id_invoice: id_invoice,
          id_customer: id_customer,
          id_create: req.user.id,
          nama_customer: nama_customer,
          no_perubahan_invoice: no_perubahan_invoice,
          no_po: no_po,
          no_invoice: no_invoice,
          tgl_invoice: tgl_invoice,
          alamat: alamat,
          tgl_faktur: tgl_faktur,
          new_alamat: new_alamat,
          new_tgl_faktur: new_tgl_faktur,
          note: note,
          file: file,
          perubahan_invoice_produk: perubahan_invoice_produk,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  requestPerubahanInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PerubahanInvoiceService.requestPerubahanInvoiceService({
          id: _id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approvePerubahanInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PerubahanInvoiceService.approvePerubahanInvoiceService({
          id: _id,
          id_approve: req.user.id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  rejectPerubahanInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PerubahanInvoiceService.rejectPerubahanInvoiceService({
          id: _id,
          id_reject: req.user.id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  deletePerubahanInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await PerubahanInvoiceService.deletePerubahanInvoiceService({
          id: _id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = PerubahanInvoiceController;
