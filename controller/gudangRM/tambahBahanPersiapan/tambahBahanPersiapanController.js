const TambahBahanPersiapanService = require("./service/tambahBahanPersiapanService");

const TambahBahanPersiapanController = {
  getTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      status_tiket,
      search,
      id_jo,
      id_kertas,
    } = req.query;

    try {
      const getData =
        await TambahBahanPersiapanService.getTambahBahanPersiapanService({
          id: _id,
          page,
          limit,
          start_date,
          end_date,
          status,
          status_tiket,
          search,
          id_jo,
          id_kertas,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createTambahBahanPersiapan: async (req, res) => {
    const {
      id_jo,
      id_kertas,
      qty_tambah_bahan_lp,
      qty_tambah_bahan_druk,
      note,
    } = req.body;

    try {
      const getData =
        await TambahBahanPersiapanService.createTambahBahanPersiapanService({
          id_jo,
          id_kertas,
          id_user_request: req.user.id,
          qty_tambah_bahan_lp,
          qty_tambah_bahan_druk,
          note,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  editTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;
    const {
      id_jo,
      id_kertas,
      id_user_request,
      id_user_qc,
      id_user_gudang,
      qty_tambah_bahan_lp,
      qty_tambah_bahan_druk,
      qty_pakai_tambah_bahan_lp,
      qty_pakai_tambah_bahan_druk,
      note,
      note_qc,
      note_gudang,
      note_qc_pemakaian,
      status,
      status_tiket,
      tambah_bahan_defect,
    } = req.body;

    try {
      const getData =
        await TambahBahanPersiapanService.editTambahBahanPersiapanService({
          id: _id,
          id_jo,
          id_kertas,
          id_user_request,
          id_user_qc,
          id_user_gudang,
          qty_tambah_bahan_lp,
          qty_tambah_bahan_druk,
          qty_pakai_tambah_bahan_lp,
          qty_pakai_tambah_bahan_druk,
          note,
          note_qc,
          note_gudang,
          note_qc_pemakaian,
          status,
          status_tiket,
          tambah_bahan_defect,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveQcTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;
    const { note_qc } = req.body;

    try {
      const getData =
        await TambahBahanPersiapanService.approveQcTambahBahanPersiapanService({
          id: _id,
          id_user_qc: req.user.id,
          note_qc,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveGudangTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;
    const { note_gudang } = req.body;

    try {
      const getData =
        await TambahBahanPersiapanService.approveGudangTambahBahanPersiapanService(
          {
            id: _id,
            id_user_gudang: req.user.id,
            note_gudang,
          }
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectQcTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;
    const { note_qc } = req.body;

    try {
      const getData =
        await TambahBahanPersiapanService.rejectQcTambahBahanPersiapanService({
          id: _id,
          id_user_qc: req.user.id,
          note_qc,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectGudangTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;
    const { note_gudang } = req.body;

    try {
      const getData =
        await TambahBahanPersiapanService.rejectGudangTambahBahanPersiapanService(
          {
            id: _id,
            id_user_gudang: req.user.id,
            note_gudang,
          }
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  pakaiTambahBahanTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;
    const { tambah_bahan_defect } = req.body;

    try {
      const getData =
        await TambahBahanPersiapanService.pakaiTambahBahanTambahBahanPersiapanService(
          {
            id: _id,
            tambah_bahan_defect,
          }
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveQcPemakaianTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;
    const { note_qc_pemakaian } = req.body;

    try {
      const getData =
        await TambahBahanPersiapanService.approveQcPakaiTambahBahanPersiapanService(
          {
            id: _id,
            id_user_qc_pemakaian: req.user.id,
            note_qc_pemakaian,
          }
        );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  deleteTambahBahanPersiapan: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await TambahBahanPersiapanService.deleteTambahBahanPersiapanService({
          id: _id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = TambahBahanPersiapanController;
