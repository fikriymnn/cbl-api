const { Op, fn, col, literal } = require("sequelize");
const SoModel = require("../../../model/marketing/so/soModel");
const soPerubahanTanggalKirimModel = require("../../../model/marketing/so/soPerubahanTanggalKirimModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");

const SoPerubahanTanggalKirimController = {
  getSoPerubahanTglKirim: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search, status } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [{ no_so: { [Op.like]: `%${search}%` } }],
        };
      }
      if (status) obj.status = status;
      if (is_active) {
        obj.is_active = is_active == "true" ? true : false;
      }
      if (page && limit) {
        const length = await soPerubahanTanggalKirimModel.count({ where: obj });
        const data = await soPerubahanTanggalKirimModel.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
          order: [["createdAt", "DESC"]],
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await soPerubahanTanggalKirimModel.findByPk(_id, {});
        res.status(200).json({
          succes: true,
          status_code: 200,
          data: response,
        });
      } else {
        const response = await soPerubahanTanggalKirimModel.findAll({
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

  createSoPerubahanTanggalKirim: async (req, res) => {
    const { id_so, tgl_awal, tgl_perubahan, note } = req.body;
    const t = await db.transaction();
    if (!id_so)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "kalkulasi wajib di isi!!",
      });
    if (!tgl_awal)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "tgl awal wajib di isi!!",
      });

    if (!tgl_perubahan)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "tgl perubahan wajib di isi!!",
      });

    try {
      const checkSo = await SoModel.findByPk(id_so);
      if (!checkSo)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data SO tidak ditemukan",
        });

      const response = await soPerubahanTanggalKirimModel.create(
        {
          id_so: checkSo.id,
          no_so: checkSo.no_so,
          tgl_awal: tgl_awal,
          tgl_perubahan: tgl_perubahan,
          note: note,
          id_user_create: req.user.id,
        },
        { transaction: t },
      );

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

  updateSoPerubahanTanggalKirim: async (req, res) => {
    const _id = req.params.id;
    const { tgl_awal, tgl_perubahan, note } = req.body;
    const t = await db.transaction();

    try {
      const checkData = await soPerubahanTanggalKirimModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await soPerubahanTanggalKirimModel.update(
        {
          tgl_awal: tgl_awal,
          tgl_perubahan: tgl_perubahan,
          note: note,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      );

      (await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Update Successful" }));
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  approveSoPerubahanTanggalKirim: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await soPerubahanTanggalKirimModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      (await soPerubahanTanggalKirimModel.update(
        {
          status: "approved",
          id_user_approve: req.user.id,
          tgl_approve: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await SoModel.update(
          { tgl_pengiriman: checkData.tgl_perubahan },
          { where: { id: checkData.id_so }, transaction: t },
        ));
      await t.commit();
      res
        .status(200)
        .json({ succes: true, status_code: 200, msg: "Approve Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  rejectSoPerubahanTanggalKirim: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await soPerubahanTanggalKirimModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      (await soPerubahanTanggalKirimModel.update(
        {
          status: "rejected",
          note_reject: note_reject,
          id_user_reject: req.user.id,
          tgl_reject: new Date(),
        },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "reject Successful" }));
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  deleteSoPerubahanTanggalKirim: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await soPerubahanTanggalKirimModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      (await soPerubahanTanggalKirimModel.update(
        { is_active: false },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Delete Successful" }));
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = SoPerubahanTanggalKirimController;
