const { Op, Sequelize, where } = require("sequelize");
const ReturService = require("./service/returService");

const ReturController = {
  getRetur: async (req, res) => {
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
      const getData = await ReturService.getReturService({
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

  getNoRetur: async (req, res) => {
    try {
      const getData = await ReturService.getNoReturService();
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createRetur: async (req, res) => {
    const {
      id_invoice,
      id_customer,
      nama_customer,
      no_po,
      no_invoice,
      no_retur,
      tgl_po,
      no_do,
      tgl_kirim,
      alamat,
      tgl_faktur,
      tgl_jatuh_tempo,
      waktu_jatuh_tempo,
      total,
      note,
      retur_produk,
    } = req.body;

    try {
      const getData = await ReturService.creteReturService({
        id_invoice: id_invoice,
        id_customer: id_customer,
        id_create: req.user.id,
        nama_customer: nama_customer,
        no_po: no_po,
        no_invoice: no_invoice,
        no_retur: no_retur,
        tgl_po: tgl_po,
        no_do: no_do,
        tgl_kirim: tgl_kirim,
        alamat: alamat,
        tgl_faktur: tgl_faktur,
        tgl_jatuh_tempo: tgl_jatuh_tempo,
        waktu_jatuh_tempo: waktu_jatuh_tempo,
        total: total,
        note: note,
        retur_produk: retur_produk,
        note: note,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateRetur: async (req, res) => {
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
      total,
      note,
      retur_produk,
    } = req.body;

    try {
      const getData = await ReturService.updateReturService({
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
        total: total,
        note: note,
        retur_produk: retur_produk,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  //   requestInvoice: async (req, res) => {
  //     const _id = req.params.id;

  //     try {
  //       const getData = await ReturService.requestReturService({
  //         id: _id,
  //       });
  //       return res.status(200).json(getData);
  //     } catch (error) {
  //       res.status(500).json({ msg: error.message });
  //     }
  //   },

  //   approveInvoice: async (req, res) => {
  //     const _id = req.params.id;

  //     try {
  //       const getData = await ReturService.approveReturService({
  //         id: _id,
  //         id_approve: req.user.id,
  //       });
  //       return res.status(200).json(getData);
  //     } catch (error) {
  //       res.status(500).json({ msg: error.message });
  //     }
  //   },
  //   rejectInvoice: async (req, res) => {
  //     const _id = req.params.id;

  //     try {
  //       const getData = await ReturService.rejectReturService({
  //         id: _id,
  //         id_reject: req.user.id,
  //       });
  //       return res.status(200).json(getData);
  //     } catch (error) {
  //       res.status(500).json({ msg: error.message });
  //     }
  //   },

  deleteInvoice: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await ReturService.deleteReturService({
        id: _id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = ReturController;
