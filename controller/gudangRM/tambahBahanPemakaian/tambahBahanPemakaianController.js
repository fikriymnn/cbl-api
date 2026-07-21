const TambahBahanPemakaianService = require("./service/tambahBahanPemakaianService");

const TambahBahanPemakaianController = {
  getTambahBahanPemakaian: async (req, res) => {
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
        await TambahBahanPemakaianService.getTambahBahanPemakaianService({
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

  createTambahBahanPemakaian: async (req, res) => {
    const {
      id_jo,
      id_kertas,
      qty_tambah_bahan_lp,
      qty_tambah_bahan_druk,
      note,
      tambah_bahan_defect,
    } = req.body;

    try {
      const getData =
        await TambahBahanPemakaianService.createTambahBahanPemakaianService({
          id_jo,
          id_kertas,
          id_user_request: req.user.id,
          qty_tambah_bahan_lp,
          qty_tambah_bahan_druk,
          note,
          tambah_bahan_defect,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  editTambahBahanPemakaian: async (req, res) => {
    const _id = req.params.id;
    const {
      id_jo,
      id_kertas,
      id_user_request,
      id_user_qc,
      id_user_gudang,
      qty_tambah_bahan_lp,
      qty_tambah_bahan_druk,
      note,
      note_qc,
      note_gudang,
      status,
      status_tiket,
      tambah_bahan_defect,
    } = req.body;

    try {
      const getData =
        await TambahBahanPemakaianService.editTambahBahanPemakaianService({
          id: _id,
          id_jo,
          id_kertas,
          id_user_request,
          id_user_qc,
          id_user_gudang,
          qty_tambah_bahan_lp,
          qty_tambah_bahan_druk,
          note,
          note_qc,
          note_gudang,
          status,
          status_tiket,
          tambah_bahan_defect,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveQcTambahBahanPemakaian: async (req, res) => {
    const _id = req.params.id;
    const { note_qc } = req.body;

    try {
      const getData =
        await TambahBahanPemakaianService.approveQcTambahBahanPemakaianService({
          id: _id,
          id_user_qc: req.user.id,
          note_qc,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  approveGudangTambahBahanPemakaian: async (req, res) => {
    const _id = req.params.id;
    const { note_gudang } = req.body;

    try {
      const getData =
        await TambahBahanPemakaianService.approveGudangTambahBahanPemakaianService(
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

  rejectQcTambahBahanPemakaian: async (req, res) => {
    const _id = req.params.id;
    const { note_qc } = req.body;

    try {
      const getData =
        await TambahBahanPemakaianService.rejectQcTambahBahanPemakaianService({
          id: _id,
          id_user_qc: req.user.id,
          note_qc,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  rejectGudangTambahBahanPemakaian: async (req, res) => {
    const _id = req.params.id;
    const { note_gudang } = req.body;

    try {
      const getData =
        await TambahBahanPemakaianService.rejectGudangTambahBahanPemakaianService(
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

  deleteTambahBahanPemakaian: async (req, res) => {
    const _id = req.params.id;

    try {
      const getData =
        await TambahBahanPemakaianService.deleteTambahBahanPemakaianService({
          id: _id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = TambahBahanPemakaianController;
