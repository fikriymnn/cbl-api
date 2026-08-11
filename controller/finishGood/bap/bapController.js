const BapService = require("./service/bapService");

const BapController = {
  getBap: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, search, status } = req.query;

    try {
      const getData = await BapService.getBapService({
        id: _id,
        page,
        limit,
        start_date,
        end_date,
        search,
        status,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getBapItem: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_bap,
      status,
      id_gudang_finish_good,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
    } = req.query;

    try {
      const getData = await BapService.getBapItemService({
        id: _id,
        page,
        limit,
        start_date,
        end_date,
        search,
        id_bap,
        status,
        id_gudang_finish_good,
        id_jo,
        id_io,
        id_so,
        id_customer,
        id_produk,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createBap: async (req, res) => {
    const { no_bap, id_gudang_finish_good } = req.body;

    try {
      const getData = await BapService.createBapService({
        no_bap,
        id_gudang_finish_good,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveMarketingBapItem: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const getData = await BapService.approveMarketingBapItemService({
        id: _id,
        note,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveBapItem: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const getData = await BapService.approveBapItemService({
        id: _id,
        note,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectBapItem: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const getData = await BapService.rejectBapItemService({
        id: _id,
        note,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  doneBap: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await BapService.doneBapService({ id: _id });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateFileBap: async (req, res) => {
    const _id = req.params.id;
    const { file_before, file_after } = req.body;

    try {
      const getData = await BapService.updateFileBapService({
        id: _id,
        file_before: file_before,
        file_after: file_after,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = BapController;
