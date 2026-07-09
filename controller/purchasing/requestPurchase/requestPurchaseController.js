const { Op, Sequelize, where } = require("sequelize");
const RequestPurchasingService = require("./service/requestPurchaseService");

const RequestPurchasingController = {
  getRequestPurchasing: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      start_date_kirim,
      end_date_kirim,
      start_date_cetak,
      end_date_cetak,
      search,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
      status,
      tipe_barang,
    } = req.query;

    try {
      const getData = await RequestPurchasingService.getRequestPurchaseService({
        id: _id,
        page: page,
        limit: limit,
        start_date: start_date,
        end_date: end_date,
        start_date_kirim: start_date_kirim,
        end_date_kirim: end_date_kirim,
        start_date_cetak: start_date_cetak,
        end_date_cetak: end_date_cetak,
        search: search,
        id_jo: id_jo,
        id_io: id_io,
        id_so: id_so,
        id_customer: id_customer,
        id_produk: id_produk,
        status: status,
        tipe_barang: tipe_barang,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getRekapTipeBarangPurchasing: async (req, res) => {
    try {
      const getData =
        await RequestPurchasingService.getRekapTipeBarangService();
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createRequestPurchasing: async (req, res) => {
    const { id_bom_ppic } = req.body;

    try {
      const getData =
        await RequestPurchasingService.creteRequestPurchaseService({
          id_user_request: req.user.id,
          id_bom_ppic: id_bom_ppic,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = RequestPurchasingController;
