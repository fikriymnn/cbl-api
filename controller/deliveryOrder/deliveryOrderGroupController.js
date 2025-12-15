const { Op, Sequelize, where } = require("sequelize");
const DeliveryOrderGroupService = require("./service/deliveryOrderGroupService");

const DeliveryOrderGroupController = {
  getDeliveryOrderGroup: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      status,
      search,
      id_customer,
      id_io,
      id_so,
      id_produk,
    } = req.query;

    try {
      const getData =
        await DeliveryOrderGroupService.getDeliveryOrderGroupService({
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          status: status,
          search: search,
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

  getNoDeliveryOrderGroup: async (req, res) => {
    try {
      const getData =
        await DeliveryOrderGroupService.getNoDeliveryOrderGroupService();
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createDeliveryOrderGroup: async (req, res) => {
    const {
      id_io,
      id_so,
      id_customer,
      id_produk,
      no_do,
      no_jo,
      no_po_customer,
      alamat,
      kota,
      is_tax,
      note,
      data_do,
      id_kendaraan,
      id_supir,
      id_kenek,
      id_kenek_2,
    } = req.body;

    try {
      const getData =
        await DeliveryOrderGroupService.creteDeliveryOrderGroupService({
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          no_do: no_do,
          no_jo: no_jo,
          no_po_customer: no_po_customer,
          alamat: alamat,
          kota: kota,
          is_tax: is_tax,
          note: note,
          data_do: data_do,
          id_create: req.user.id,
          id_kendaraan: id_kendaraan,
          id_supir: id_supir,
          id_kenek: id_kenek,
          id_kenek_2: id_kenek_2,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res
        .status(500)
        .json({ status_code: 400, success: false, msg: error.message });
    }
  },

  konfirmasiDeliveryOrderGroup: async (req, res) => {
    const _id = req.params.id;
    const {
      id_io,
      id_so,
      id_customer,
      id_produk,
      no_do,
      no_jo,
      no_po_customer,
      alamat,
      kota,
      is_tax,
      note,
      data_do,
      id_kendaraan,
      id_supir,
      id_kenek,
      id_kenek_2,
    } = req.body;

    try {
      const getData =
        await DeliveryOrderGroupService.konfirmasiDeliveryOrderGroupService({
          id: _id,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
          no_do: no_do,
          no_jo: no_jo,
          no_po_customer: no_po_customer,
          alamat: alamat,
          kota: kota,
          is_tax: is_tax,
          note: note,
          data_do: data_do,
          id_approve: req.user.id,
          id_kendaraan: id_kendaraan,
          id_supir: id_supir,
          id_kenek: id_kenek,
          id_kenek_2: id_kenek_2,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res
        .status(500)
        .json({ status_code: 400, success: false, msg: error.message });
    }
  },
};

module.exports = DeliveryOrderGroupController;
