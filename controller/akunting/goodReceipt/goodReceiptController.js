const GoodReceiptService = require("./service/goodReceiptService");

const GoodReceiptController = {
  getGoodReceipt: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_vendor,
      id_invoice_ap,
      is_created_invoice,
    } = req.query;

    try {
      const getData = await GoodReceiptService.getGoodReceiptService({
        id: _id,
        page,
        limit,
        start_date,
        end_date,
        search,
        id_vendor,
        id_invoice_ap,
        is_created_invoice,
      });
      return res.status(getData.status).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = GoodReceiptController;
