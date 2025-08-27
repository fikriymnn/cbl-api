const { Op } = require("sequelize");
const MastertahapanMesin = require("../../../model/masterData/tahapan/masterTahapanMesinModel");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const MasterMesinTahapan = require("../../../model/masterData/tahapan/masterMesinTahapanModel");
const db = require("../../../config/database");

const MastertahapanMesinController = {
  getMastertahapanMesin: async (req, res) => {
    const _id = req.params.id;
    const { is_active, page, limit, search, id_tahapan } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [{ shift: { [Op.like]: `%${search}%` } }],
        };
      }
      if (id_tahapan) obj.id_tahapan = id_tahapan;
      if (is_active) obj.is_active = is_active;
      if (page && limit) {
        const length = await MastertahapanMesin.count({ where: obj });
        const data = await MastertahapanMesin.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
          include: [
            {
              model: MasterMesinTahapan,
              as: "mesin",
            },
            { model: MasterTahapan, as: "tahapan" },
          ],
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await MastertahapanMesin.findByPk(_id, {
          include: [
            {
              model: MasterMesinTahapan,
              as: "mesin",
            },
            { model: MasterTahapan, as: "tahapan" },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MastertahapanMesin.findAll({
          where: obj,
          include: [
            {
              model: MasterMesinTahapan,
              as: "mesin",
            },
            { model: MasterTahapan, as: "tahapan" },
          ],
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

  createMastertahapanMesin: async (req, res) => {
    const { id_tahapan, id_mesin_tahapan, shift } = req.body;
    const t = await db.transaction();
    try {
      if (!id_tahapan) {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "tahapan wajib di isi!!",
        });
      } else {
        const checkData = await MasterTahapan.findByPk(id_tahapan);
        if (!checkData)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data tahapan tidak ditemukan!!",
          });
      }
      if (!id_mesin_tahapan) {
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "mesin wajib di isi!!",
        });
      } else {
        const checkMesin = await MasterMesinTahapan.findByPk(id_mesin_tahapan);
        if (!checkMesin)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data mesin tidak ditemukan!!",
          });
      }

      const response = await MastertahapanMesin.create(
        {
          id_tahapan: id_tahapan,
          id_mesin_tahapan: id_mesin_tahapan,
          shift: shift,
        },
        { transaction: t }
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

  updateMastertahapanMesin: async (req, res) => {
    const _id = req.params.id;
    const { id_tahapan, id_mesin_tahapan, shift, is_active } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (id_tahapan) {
        const checkTahapan = await MasterTahapan.findByPk(id_tahapan);
        if (!checkTahapan)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data tahapan tidak ditemukan",
          });
        obj.id_tahapan = id_tahapan;
      }
      if (id_mesin_tahapan) {
        const checkMesinTahapan = await MasterMesinTahapan.findByPk(
          id_mesin_tahapan
        );
        if (!checkMesinTahapan)
          return res.status(404).json({
            succes: false,
            status_code: 404,
            msg: "Data mesin tidak ditemukan",
          });
        obj.id_mesin_tahapan = id_mesin_tahapan;
      }
      if (shift) obj.shift = shift;
      if (is_active) obj.is_active = is_active;

      const checkData = await MastertahapanMesin.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MastertahapanMesin.update(obj, {
        where: { id: _id },
        transaction: t,
      });

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

  deleteMastertahapanMesin: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MastertahapanMesin.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MastertahapanMesin.destroy({
        where: { id: _id },
        transaction: t,
      }),
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

module.exports = MastertahapanMesinController;
