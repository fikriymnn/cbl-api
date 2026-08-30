const BomPpicService = require("./service/bomPpicService");

const BomPpicController = {
  getBomPpicModel: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      status_proses,
      search,
      is_request_purchase,
    } = req.query;

    try {
      const getData = await BomPpicService.getBomPpicModelService({
        id: _id,
        page,
        limit,
        start_date,
        end_date,
        status,
        status_proses,
        search,
        is_request_purchase,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getBomPpicJumlahData: async (req, res) => {
    try {
      const getData = await BomPpicService.getBomPpicJumlahDataService();
      return res.status(200).json(getData);
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createBomPpicModel: async (req, res) => {
    const {
      id_io,
      id_so,
      id_bom,
      no_bom_ppic,
      no_io,
      no_so,
      no_bom,
      no_jo,
      customer,
      produk,
      tgl_rencana_cetak,
      tgl_kirim_customer,
      bom_ppic_kertas,
      bom_ppic_tinta,
      bom_ppic_corrugated,
      bom_ppic_poliban,
      bom_ppic_coating,
      bom_ppic_lem,
      lain_lain,
      qty_po,
      qty_fg,
    } = req.body;

    try {
      const getData = await BomPpicService.createBomPpicModelService({
        id_io,
        id_so,
        id_bom,
        no_bom_ppic,
        no_io,
        no_so,
        no_bom,
        no_jo,
        customer,
        produk,
        tgl_rencana_cetak,
        tgl_kirim_customer,
        bom_ppic_kertas,
        bom_ppic_tinta,
        bom_ppic_corrugated,
        bom_ppic_poliban,
        bom_ppic_coating,
        bom_ppic_lem,
        lain_lain,
        qty_po,
        qty_fg,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateBomPpicModel: async (req, res) => {
    const { id } = req.params;
    const {
      id_io,
      id_so,
      id_io_mounting,
      nama_mounting,
      no_bom,
      no_io,
      no_so,
      customer,
      produk,
      bom_ppic_kertas,
      bom_ppic_tinta,
      bom_ppic_corrugated,
      bom_ppic_poliban,
      bom_ppic_coating,
      bom_ppic_lem,
      lain_lain,
      tgl_rencana_cetak,
      tgl_kirim_customer,
    } = req.body;

    try {
      const getData = await BomPpicService.updateBomPpicModelService({
        id,
        id_io,
        id_so,
        id_io_mounting,
        nama_mounting,
        no_bom,
        no_io,
        no_so,
        customer,
        produk,
        bom_ppic_kertas,
        bom_ppic_tinta,
        bom_ppic_corrugated,
        bom_ppic_poliban,
        bom_ppic_coating,
        bom_ppic_lem,
        lain_lain,
        tgl_rencana_cetak,
        tgl_kirim_customer,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  submitRequestBomPpic: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await BomPpicService.submitRequestBomPpicService({
        id: _id,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  approveBomPpic: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await BomPpicService.approveBomPpicService({
        id: _id,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  rejectBomPpic: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;

    try {
      const getData = await BomPpicService.rejectBomPpicService({
        id: _id,
        id_user: req.user.id,
        note_reject,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  backToProcessBom: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData = await BomPpicService.backToProcessBomService({
        id: _id,
        id_user: req.user.id,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },
};

module.exports = BomPpicController;
