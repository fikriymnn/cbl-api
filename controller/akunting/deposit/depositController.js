const { Op, Sequelize, where } = require("sequelize");
const Deposit = require("./service/depositService");

const DepositController = {
  getDeposit: async (req, res) => {
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
      const getData = await Deposit.getDepositService({
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

  getNoDeposit: async (req, res) => {
    try {
      const getData = await Deposit.getNoDepositService();
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  createDeposit: async (req, res) => {
    const {
      id_customer,
      no_deposit,
      cara_bayar,
      billing_address,
      tgl_faktur,
      nominal,
      note,
    } = req.body;

    try {
      const getData = await Deposit.creteDepositService({
        id_customer: id_customer,
        id_create: req.user.id,
        no_deposit: no_deposit,
        cara_bayar: cara_bayar,
        billing_address: billing_address,
        tgl_faktur: tgl_faktur,
        nominal: nominal,
        note: note,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateDeposit: async (req, res) => {
    const _id = req.params.id;
    const {
      id_customer,
      no_deposit,
      cara_bayar,
      billing_address,
      tgl_faktur,
      nominal,
      note,
    } = req.body;

    try {
      const getData = await Deposit.updateDepositService({
        id: _id,
        id_customer: id_customer,
        no_deposit: no_deposit,
        cara_bayar: cara_bayar,
        billing_address: billing_address,
        tgl_faktur: tgl_faktur,
        nominal: nominal,
        note: note,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  requestDeposit: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await Deposit.requestDepositService({
        id: _id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveDeposit: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await Deposit.approveDepositService({
        id: _id,
        id_approve: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  rejectDeposit: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await Deposit.rejectDepositService({
        id: _id,
        id_reject: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteDeposit: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await Deposit.deleteDepositService({
        id: _id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = DepositController;
