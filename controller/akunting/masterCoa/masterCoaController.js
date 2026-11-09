const MasterCoaService = require("./service/masterCoaService");

const sendError = (res, error) =>
  res.status(error.status_code || 500).json({
    success: false,
    status_code: error.status_code || 500,
    msg: error.message,
  });

const MasterCoaController = {
  getTipeAkun: async (req, res) => {
    try {
      const getData = await MasterCoaService.getTipeAkunService();
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMasterCoa: async (req, res) => {
    const {
      page,
      limit,
      search,
      tipe,
      tipe_saldo,
      tipe_report,
      branch,
      show_inactive,
    } = req.query;

    try {
      const getData = await MasterCoaService.getMasterCoaService({
        id: req.params.id,
        page,
        limit,
        search,
        tipe,
        tipe_saldo,
        tipe_report,
        branch,
        show_inactive,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getMasterCoaTree: async (req, res) => {
    const { search, branch, show_inactive } = req.query;

    try {
      const getData = await MasterCoaService.getMasterCoaTreeService({
        search,
        branch,
        show_inactive,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getParentCoa: async (req, res) => {
    const { tipe, exclude_id } = req.query;

    try {
      const getData = await MasterCoaService.getParentCoaService({
        tipe,
        exclude_id,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterCoa: async (req, res) => {
    const {
      id_parent,
      kode_akun,
      nama_akun,
      tipe,
      tipe_saldo,
      tipe_report,
      branch,
      currency,
      no_rekening,
      note,
      opening_balance,
      opening_balance_date,
    } = req.body;

    try {
      const getData = await MasterCoaService.createMasterCoaService({
        id_create: req.user.id,
        id_parent,
        kode_akun,
        nama_akun,
        tipe,
        tipe_saldo,
        tipe_report,
        branch,
        currency,
        no_rekening,
        note,
        opening_balance,
        opening_balance_date,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  updateMasterCoa: async (req, res) => {
    const {
      id_parent,
      kode_akun,
      nama_akun,
      tipe,
      tipe_saldo,
      tipe_report,
      branch,
      currency,
      no_rekening,
      note,
      opening_balance,
      opening_balance_date,
    } = req.body;

    try {
      const getData = await MasterCoaService.updateMasterCoaService({
        id: req.params.id,
        id_parent,
        kode_akun,
        nama_akun,
        tipe,
        tipe_saldo,
        tipe_report,
        branch,
        currency,
        no_rekening,
        note,
        opening_balance,
        opening_balance_date,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  setActiveMasterCoa: async (req, res) => {
    try {
      const getData = await MasterCoaService.setActiveMasterCoaService({
        id: req.params.id,
        is_active: req.body.is_active,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },

  deleteMasterCoa: async (req, res) => {
    try {
      const getData = await MasterCoaService.deleteMasterCoaService({
        id: req.params.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      sendError(res, error);
    }
  },
};

module.exports = MasterCoaController;
