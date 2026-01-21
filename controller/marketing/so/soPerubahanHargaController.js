const { Op, fn, col, literal } = require("sequelize");
const SoModel = require("../../../model/marketing/so/soModel");
const soPerubahanHargaModel = require("../../../model/marketing/so/soPerubahanHargaModel");
const Users = require("../../../model/userModel");
const db = require("../../../config/database");

const SoPerubahanHargaController = {
  getSoPerubahanHarga: async (req, res) => {
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
        const length = await soPerubahanHargaModel.count({ where: obj });
        const data = await soPerubahanHargaModel.findAll({
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
        const response = await soPerubahanHargaModel.findByPk(_id, {});
        res.status(200).json({
          succes: true,
          status_code: 200,
          data: response,
        });
      } else {
        const response = await soPerubahanHargaModel.findAll({
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

  createSoPerubahanHarga: async (req, res) => {
    const { id_so, harga_awal, harga_perubahan, note } = req.body;
    const t = await db.transaction();
    if (!id_so)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "kalkulasi wajib di isi!!",
      });
    if (!harga_awal)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "tgl awal wajib di isi!!",
      });

    if (!harga_perubahan)
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

      const response = await soPerubahanHargaModel.create(
        {
          id_so: checkSo.id,
          no_so: checkSo.no_so,
          harga_awal: harga_awal,
          harga_perubahan: harga_perubahan,
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

  updateSoPerubahanHarga: async (req, res) => {
    const _id = req.params.id;
    const { harga_awal, harga_perubahan, note } = req.body;
    const t = await db.transaction();

    try {
      const checkData = await soPerubahanHargaModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await soPerubahanHargaModel.update(
        {
          harga_awal: harga_awal,
          harga_perubahan: harga_perubahan,
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

  approveSoPerubahanHarga: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await soPerubahanHargaModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });

      const checkSo = await SoModel.findByPk(checkData.id_so);
      if (!checkSo)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data SO tidak ditemukan",
        });
      (await soPerubahanHargaModel.update(
        {
          status: "approved",
          id_user_approve: req.user.id,
        },
        {
          where: { id: _id },
          transaction: t,
        },
      ),
        await SoModel.update(
          {
            harga_jual: checkData.harga_perubahan,
            total_harga: checkSo.po_qty * checkData.harga_perubahan,
            tgl_approve: new Date(),
          },
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

  rejectSoPerubahanHarga: async (req, res) => {
    const _id = req.params.id;
    const { note_reject } = req.body;
    const t = await db.transaction();
    try {
      const checkData = await soPerubahanHargaModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      (await soPerubahanHargaModel.update(
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

  deleteSoPerubahanHarga: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await soPerubahanHargaModel.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      (await soPerubahanHargaModel.update(
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

module.exports = SoPerubahanHargaController;
