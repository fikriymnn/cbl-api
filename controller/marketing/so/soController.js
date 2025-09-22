const { Op } = require("sequelize");
const SoModel = require("../../../model/marketing/so/soModel");
const Kalkulasi = require("../../../model/marketing/kalkulasi/kalkulasiModel");
const SoUserAction = require("../../../model/marketing/so/soUserActionModel");
const Io = require("../../../model/marketing/io/ioModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");

const SoController = {
  getSo: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search, status, status_proses } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [
            { no_so: { [Op.like]: `%${search}%` } },
            { status_jo: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
            { produk: { [Op.like]: `%${search}%` } },
          ],
        };
      }
      if (status) obj.status = status;
      if (status_proses) obj.status_proses = status_proses;
      if (is_active) {
        obj.is_active = is_active == "true" ? true : false;
      }
      if (page && limit) {
        const length = await SoModel.count({ where: obj });
        const data = await SoModel.findAll({
          where: obj,

          offset: parseInt(offset),
          limit: parseInt(limit),
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await SoModel.findByPk(_id, {
          include: [
            {
              model: Users,
              as: "user_create",
            },
            {
              model: Users,
              as: "user_approve",
            },

            {
              model: SoUserAction,
              as: "so_action_user",
              include: { model: Users, as: "user" },
            },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await SoModel.findAll({
          where: obj,
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      }
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createSo: async (req, res) => {
    const {
      id_kalkulasi,
      no_so,
      tgl_input_po,
      id_so_cancel,
      so_cancel,
      status_jo,
      status_produk,
      tgl_acc_customer,
      tgl_po_customer,
      po_qty,
      harga_jual,
      total_harga,
      no_po_customer,
      keterangan,
      ppn,
      profit,
      tgl_pengiriman,
      alamat_pengiriman,
      ada_standar_warna,
      is_io_selesai,
    } = req.body;
    const t = await db.transaction();
    if (!id_kalkulasi)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "kalkulasi wajib di isi!!",
      });
    if (!no_so)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "no so wajib di isi!!",
      });

    try {
      const checkKalkulasi = await Kalkulasi.findByPk(id_kalkulasi);
      if (!checkKalkulasi)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data Kalkulasi tidak ditemukan",
        });
      const checkIo = await Io.findByPk(checkKalkulasi.id_io);
      if (!checkIo)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data io tidak ditemukan",
        });

      const response = await SoModel.create(
        {
          id_io: checkIo.id,
          id_create_io: req.user.id,
          no_io: checkIo.no_io,
          no_so: no_so,
          customer: checkIo.customer,
          produk: checkIo.produk,
          tgl_input_po,
          id_so_cancel,
          so_cancel,
          status_jo,
          status_produk,
          tgl_acc_customer,
          tgl_po_customer,
          po_qty,
          harga_jual,
          total_harga,
          no_po_customer,
          keterangan,
          ppn,
          profit,
          tgl_pengiriman,
          alamat_pengiriman,
          ada_standar_warna,
        },
        { transaction: t }
      );

      if (is_io_selesai == true || is_io_selesai == "true") {
        await Kalkulasi.update(
          { is_io_active: false },
          { where: { id: id_kalkulasi }, transaction: t }
        );
      }

      await t.commit();
      return res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successful",
        data: response,
      });
    } catch (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  updateSo: async (req, res) => {
    const _id = req.params.id;
    const { data_so } = req.body;
    const t = await db.transaction();

    try {
      const checkData = await SoModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await SoModel.update(
        {
          tgl_input_po: data_so.tgl_input_po,
          id_so_cancel: data_so.id_so_cancel,
          so_cancel: data_so.so_cancel,
          status_jo: data_so.status_jo,
          status_produk: data_so.status_produk,
          tgl_acc_customer: data_so.tgl_acc_customer,
          tgl_po_customer: data_so.tgl_po_customer,
          po_qty: data_so.po_qty,
          harga_jual: data_so.harga_jual,
          total_harga: data_so.total_harga,
          no_po_customer: data_so.no_po_customer,
          keterangan: data_so.keterangan,
          ppn: data_so.ppn,
          profit: data_so.profit,
          tgl_pengiriman: data_so.tgl_pengiriman,
          alamat_pengiriman: data_so.alamat_pengiriman,
          ada_standar_warna: data_so.ada_standar_warna,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await SoUserAction.create(
        { id_io: checkData.id, id_user: req.user.id, status: "update" },
        { transaction: t }
      );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  submitRequestSo: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await SoModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await SoModel.update(
        {
          status: "requested",
          status_proses: "request to kabag",
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await SoUserAction.create(
          { id_io: checkData.id, id_user: req.user.id, status: "requested" },
          { transaction: t }
        );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Request Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  approveSo: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await SoModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await SoModel.update(
        {
          status: "history",
          status_proses: "done",
          id_approve_io: req.user.id,
          tgl_approve_io: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Approve Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  rejectSo: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await SoModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await SoModel.update(
        {
          status_proses: "reject kabag",
          posisi_proses: "draft",
          note_reject: note_reject,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await SoUserAction.create(
          { id_io: checkData.id, id_user: req.user.id, status: "kabag reject" },
          { transaction: t }
        );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "reject Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  deleteSo: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await SoModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await SoModel.update(
        { is_active: false },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await SoUserAction.create(
          {
            id_io: checkData.id,
            id_user: req.user.id,
            status: "delete io",
          },
          { transaction: t }
        );
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Delete Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = SoController;
