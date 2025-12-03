const { Op, Sequelize, where } = require("sequelize");
const DeliveryOrderService = require("./service/deliveryOrderService");

const DeliveryOrderController = {
  getDeliveryOrder: async (req, res) => {
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
    } = req.query;

    try {
      const getData = await DeliveryOrderService.getDeliveryOrderService({
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
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = DeliveryOrderController;
