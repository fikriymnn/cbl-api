const MasterKodeAnalisis = require("../../../../model/masterData/masterKodeAnalisisModel");
const MasterChildGrupKodeAnalisis = require("../../../../model/masterData/mtc/grupKodeAnalisis/masterChildGrupKodeAnalisisModel");
const MasterMainGrupKodeAnalisis = require("../../../../model/masterData/mtc/grupKodeAnalisis/masterMainGrupKodeAnalisisModel");
const db = require("../../../../config/database");
const { Op } = require("sequelize");

const masterGrupKodeAnalisisController = {
  getMasterAnalisisGrup: async (req, res) => {
    const _id = req.params.id;
    const { kode_kendala, search } = req.query;
    let obj = {};
    if (search) {
      obj = {
        [Op.or]: [
          { kode_kendala: { [Op.like]: `%${search}%` } },
          { nama_kendala: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    try {
      if (_id) {
        const response = await MasterMainGrupKodeAnalisis.findByPk(_id, {
          include: [
            {
              model: MasterChildGrupKodeAnalisis,
              as: "child_grup",
              include: [
                {
                  model: MasterKodeAnalisis,
                  as: "kode_analisis",
                },
              ],
            },
          ],
        });
        res.status(200).json({ data: response });
      } else if (kode_kendala) {
        const checkKode = await MasterMainGrupKodeAnalisis.findOne({
          where: { kode_kendala: kode_kendala },
          include: [
            {
              model: MasterChildGrupKodeAnalisis,
              as: "child_grup",
              include: [
                {
                  model: MasterKodeAnalisis,
                  as: "kode_analisis",
                },
              ],
            },
          ],
        });
        if (checkKode) {
          res.status(200).json({ data: checkKode });
        } else {
          const response = await MasterMainGrupKodeAnalisis.findAll({
            where: obj,
            include: [
              {
                model: MasterChildGrupKodeAnalisis,
                as: "child_grup",
                include: [
                  {
                    model: MasterKodeAnalisis,
                    as: "kode_analisis",
                  },
                ],
              },
            ],
          });
          res.status(200).json({ data: response });
        }
      } else {
        const response = await MasterMainGrupKodeAnalisis.findAll({
          where: obj,
          include: [
            {
              model: MasterChildGrupKodeAnalisis,
              as: "child_grup",
              include: [
                {
                  model: MasterKodeAnalisis,
                  as: "kode_analisis",
                },
              ],
            },
          ],
        });
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKodeMain: async (req, res) => {
    const { kode_kendala, nama_kendala } = req.body;
    if (!kode_kendala || !nama_kendala)
      return res.status(404).json({ msg: "incomplete data!!" });
    const t = await db.transaction();

    try {
      await MasterMainGrupKodeAnalisis.create(
        {
          kode_kendala,
          nama_kendala,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({ msg: "create successful" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKodeChild: async (req, res) => {
    const { id_main_grup, id_kode_analisis } = req.body;
    if (!id_main_grup || !id_kode_analisis)
      return res.status(404).json({ msg: "incomplete data!!" });
    const t = await db.transaction();

    try {
      const checkMain = await MasterMainGrupKodeAnalisis.findByPk(id_main_grup);
      const checkKode = await MasterKodeAnalisis.findByPk(id_kode_analisis);
      if (!checkMain)
        return res.status(404).json({ msg: "main data not found!" });
      if (!checkKode)
        return res.status(404).json({ msg: "kode analisis not found!" });
      await MasterChildGrupKodeAnalisis.create(
        {
          id_main_grup,
          id_kode_analisis,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({ msg: "create successful" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterKodeMain: async (req, res) => {
    const _id = req.params.id;
    const { kode_kendala, nama_kendala } = req.body;
    const t = await db.transaction();
    let obj = {};

    if (kode_kendala) obj.kode_kendala = kode_kendala;
    if (nama_kendala) obj.nama_kendala = nama_kendala;

    try {
      await MasterMainGrupKodeAnalisis.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await t.commit();
      res.status(200).json({ msg: "update successful" });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  deleteMasterKodeMain: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      await MasterMainGrupKodeAnalisis.destroy({
        where: { id: _id },
        transaction: t,
      }),
        await t.commit();
      res.status(201).json({ msg: "delete Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
  deleteMasterKodeChild: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      await MasterChildGrupKodeAnalisis.destroy({
        where: { id: _id },
        transaction: t,
      }),
        await t.commit();
      res.status(201).json({ msg: "delete Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterGrupKodeAnalisisController;
