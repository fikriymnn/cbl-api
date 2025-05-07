const { Op, Sequelize, where } = require("sequelize");
const BookingJadwal = require("../../../model/ppic/bookingJadwal/bookingJadwalModel");
const db = require("../../../config/database");

const BookingJadwalController = {
  getBookingJadwal: async (req, res) => {
    const _id = req.params.id;
    const { page, limit, start_date, end_date, search, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let obj = {};
    if (search)
      obj = {
        [Op.or]: [{ no_io: { [Op.like]: `%${search}%` } }],
        [Op.or]: [{ mesin: { [Op.like]: `%${search}%` } }],
        [Op.or]: [{ nama_customer: { [Op.like]: `%${search}%` } }],
        [Op.or]: [{ nama_item: { [Op.like]: `%${search}%` } }],
      };
    if (status) obj.status = status;
    if (start_date && end_date) {
      const startDate = new Date(start_date).setHours(0, 0, 0, 0);
      const endDate = new Date(end_date).setHours(23, 59, 59, 999);
      obj.tanggal = {
        [Op.between]: [startDate, endDate],
      };
    }
    try {
      if (page && limit) {
        const length = await BookingJadwal.count({ where: obj });
        const data = await BookingJadwal.findAll({
          order: [["tanggal", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        return res.status(200).json({
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const data = await BookingJadwal.findByPk(_id);
        return res.status(200).json({
          data: data,
        });
      } else {
        const data = await BookingJadwal.findAll({
          order: [["tanggal", "DESC"]],
          where: obj,
        });
        return res.status(200).json({
          data: data,
        });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createBookingJadwal: async (req, res) => {
    const {
      tanggal,
      mesin,
      no_io,
      nama_customer,
      nama_item,
      qty_pcs,
      qty_druk,
    } = req.body;
    const t = await db.transaction();

    try {
      if (
        !tanggal ||
        !mesin ||
        !no_io ||
        !nama_customer ||
        !nama_item ||
        !qty_pcs ||
        !qty_druk
      )
        return res.status(404).json({ msg: "incomplete data!!" });

      const response = await BookingJadwal.create(
        {
          tanggal,
          mesin,
          no_io,
          nama_customer,
          nama_item,
          qty_pcs,
          qty_druk,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({
        data: response,
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateBookingJadwal: async (req, res) => {
    const _id = req.params.id;
    const {
      tanggal,
      mesin,
      no_io,
      nama_customer,
      nama_item,
      qty_pcs,
      qty_druk,
    } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (tanggal) obj.tanggal = tanggal;
      if (mesin) obj.mesin = mesin;
      if (no_io) obj.no_io = no_io;
      if (nama_customer) obj.nama_customer = nama_customer;
      if (nama_item) obj.nama_item = nama_item;
      if (qty_pcs) obj.qty_pcs = qty_pcs;
      if (qty_druk) obj.qty_druk = qty_druk;

      const dataBooking = await BookingJadwal.findByPk(_id);
      if (!dataBooking)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await BookingJadwal.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await t.commit();
      res.status(200).json({
        msg: "Update Successfully",
      });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  doneBookingJadwal: async (req, res) => {
    const _id = req.params.id;

    const t = await db.transaction();

    try {
      const dataBooking = await BookingJadwal.findByPk(_id);
      if (!dataBooking)
        return res.status(404).json({ msg: "data tidak di temukan" });

      await BookingJadwal.update(
        {
          status: "history",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();
      res.status(200).json({ msg: "Done Successfully" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = BookingJadwalController;
