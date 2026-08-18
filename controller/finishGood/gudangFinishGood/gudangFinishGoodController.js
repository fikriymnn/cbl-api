const { Op, Sequelize, where } = require("sequelize");
const GudangFinishGoodService = require("./service/gudangFinishGoodService");

const GudangFinishGoodController = {
  getGudangFinishGood: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
      status,
    } = req.query;

    try {
      const getData = await GudangFinishGoodService.getGudangFinishGoodService({
        id: _id,
        page: page,
        limit: limit,
        start_date: start_date,
        end_date: end_date,
        search: search,
        id_jo: id_jo,
        id_io: id_io,
        id_so: id_so,
        id_customer: id_customer,
        id_produk: id_produk,
        status: status,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getGudangFinishGoodByIo: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      status,
      is_more_than_90_days,
    } = req.query;

    try {
      const getData =
        await GudangFinishGoodService.getGudangFinishGoodGroupByIo({
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          search: search,
          status: status,
          is_more_than_90_days: is_more_than_90_days === "true" ? true : false,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getGudangFinishGoodByIdIo: async (req, res) => {
    const { id_io } = req.query;

    try {
      if (!id_io)
        return res
          .status(404)
          .json({ status_code: 404, success: false, msg: "id_io wajib" });
      const getData = await GudangFinishGoodService.getGudangFinishGoodByIdIo({
        id_io: id_io,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getGudangFinishGoodByJo: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, search, id_io, status } =
      req.query;

    try {
      const getData =
        await GudangFinishGoodService.getGudangFinishGoodGroupByJO({
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          search: search,
          id_io: id_io,
          status: status,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  sendDoGudangFinishGoodSingle: async (req, res) => {
    const { data_barang } = req.body;

    try {
      const getData =
        await GudangFinishGoodService.sendDoGudangFinishGoodSingle({
          data_barang: data_barang,
          id_user: req.user.id,
        });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  sendDoGudangFinishGoodGroup: async (req, res) => {
    const { data_barang } = req.body;

    try {
      const getData = await GudangFinishGoodService.sendDoGudangFinishGoodGroup(
        {
          data_barang: data_barang,
          id_user: req.user.id,
        },
      );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getJoBookingNormalFG: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
    } = req.query;

    try {
      const getData = await GudangFinishGoodService.getJoBookingNormalFGService(
        {
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          search: search,
          id_jo: id_jo,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
        },
      );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getJoBookingKanbanFG: async (req, res) => {
    const _id = req.params.id;
    const {
      page,
      limit,
      start_date,
      end_date,
      search,
      id_jo,
      id_io,
      id_so,
      id_customer,
      id_produk,
    } = req.query;

    try {
      const getData = await GudangFinishGoodService.getJoBookingKanbanFGService(
        {
          id: _id,
          page: page,
          limit: limit,
          start_date: start_date,
          end_date: end_date,
          search: search,
          id_jo: id_jo,
          id_io: id_io,
          id_so: id_so,
          id_customer: id_customer,
          id_produk: id_produk,
        },
      );
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  bookingDoGudangFinishGood: async (req, res) => {
    const { data_barang, id_jo_booking } = req.body;

    try {
      const getData = await GudangFinishGoodService.bookingJoGudangFinishGood({
        data_barang: data_barang,
        id_jo_booking: id_jo_booking,
      });
      return res.status(200).json(getData);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = GudangFinishGoodController;
