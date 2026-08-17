const EstimasiKurangQtyService = require("./service/estimasiKurangQtyService");

const EstimasiKurangQtyController = {
  getEstimasiKurangQty: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      search,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
      id_tahapan,
      is_active,
    } = req.query;

    try {
      const getData =
        await EstimasiKurangQtyService.getEstimasiKurangQtyService({
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          status: status,
          search: search,
          id_jo: id_jo,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          id_tahapan: id_tahapan,
          is_active: is_active,
        });
      return res.status(getData.status || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createEstimasiKurangQty: async (req, res) => {
    const { id_produksi_lkh_tahapan, qty_kurang_qty } = req.body;

    try {
      const createData =
        await EstimasiKurangQtyService.createEstimasiKurangQtyService({
          id_produksi_lkh_tahapan: id_produksi_lkh_tahapan,
          qty_kurang_qty: qty_kurang_qty,
          id_user: req.user.id,
        });
      return res.status(createData.status_code || 200).json(createData);
    } catch (error) {
      res.status(error.status_code || 500).json({ msg: error.message });
    }
  },

  updateEstimasiKurangQty: async (req, res) => {
    const _id = req.params.id;
    const { qty_kurang_qty, spesifikasi } = req.body;

    try {
      const updateData =
        await EstimasiKurangQtyService.updateEstimasiKurangQtyService({
          id: _id,
          qty_kurang_qty: qty_kurang_qty,
          spesifikasi: spesifikasi,
        });
      return res.status(updateData.status_code || 200).json(updateData);
    } catch (error) {
      res.status(error.status_code || 500).json({ msg: error.message });
    }
  },

  deleteEstimasiKurangQty: async (req, res) => {
    const _id = req.params.id;

    try {
      const deleteData =
        await EstimasiKurangQtyService.deleteEstimasiKurangQtyService({
          id: _id,
        });
      return res.status(deleteData.status_code || 200).json(deleteData);
    } catch (error) {
      res.status(error.status_code || 500).json({ msg: error.message });
    }
  },

  approveEstimasiKurangQty: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const approveData =
        await EstimasiKurangQtyService.approveEstimasiKurangQtyService({
          id: _id,
          id_user: req.user.id,
          note: note,
        });
      return res.status(approveData.status_code || 200).json(approveData);
    } catch (error) {
      res.status(error.status_code || 500).json({ msg: error.message });
    }
  },
};

module.exports = EstimasiKurangQtyController;
