const InformasiKurangQtyService = require("./service/informasiKurangQtyService");

const sendError = (res, error) =>
  res.status(error.status_code || 500).json({
    success: false,
    status_code: error.status_code || 500,
    msg: error.message,
  });

const InformasiKurangQtyController = {
  getInformasiKurangQty: async (req, res) => {
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_jo,
      id_produk,
      id_mesin_cetak,
    } = req.query;

    try {
      const getData =
        await InformasiKurangQtyService.getInformasiKurangQtyService({
          id: req.params.id,
          page,
          limit,
          start_date,
          end_date,
          search,
          id_jo,
          id_produk,
          id_mesin_cetak,
        });
      return res.status(getData.status || 200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createInformasiKurangQty: async (req, res) => {
    const {
      id_jo,
      no_jo,
      id_produk,
      nama_produk,
      qty_po,
      qty_kurang,
      id_mesin_cetak,
      nama_mesin_cetak,
      tgl_cetak,
      jenis_kerusakan,
      note,
    } = req.body;

    try {
      const createData =
        await InformasiKurangQtyService.createInformasiKurangQtyService({
          id_jo,
          no_jo,
          id_produk,
          nama_produk,
          qty_po,
          qty_kurang,
          id_mesin_cetak,
          nama_mesin_cetak,
          tgl_cetak,
          jenis_kerusakan,
          note,
          id_create: req.user.id,
        });
      return res.status(createData.status_code || 200).json(createData);
    } catch (error) {
      sendError(res, error);
    }
  },

  updateInformasiKurangQty: async (req, res) => {
    const {
      id_jo,
      no_jo,
      id_produk,
      nama_produk,
      qty_po,
      qty_kurang,
      id_mesin_cetak,
      nama_mesin_cetak,
      tgl_cetak,
      jenis_kerusakan,
      note,
    } = req.body;

    try {
      const updateData =
        await InformasiKurangQtyService.updateInformasiKurangQtyService({
          id: req.params.id,
          id_jo,
          no_jo,
          id_produk,
          nama_produk,
          qty_po,
          qty_kurang,
          id_mesin_cetak,
          nama_mesin_cetak,
          tgl_cetak,
          jenis_kerusakan,
          note,
        });
      return res.status(updateData.status_code || 200).json(updateData);
    } catch (error) {
      sendError(res, error);
    }
  },

  deleteInformasiKurangQty: async (req, res) => {
    try {
      const deleteData =
        await InformasiKurangQtyService.deleteInformasiKurangQtyService({
          id: req.params.id,
        });
      return res.status(deleteData.status_code || 200).json(deleteData);
    } catch (error) {
      sendError(res, error);
    }
  },
};

module.exports = InformasiKurangQtyController;
