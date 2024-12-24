const MasterDryingTimeModel = require("../../../model/masterData/ppic/masterDryingTimeModel");

const db = require("../../../config/database");

const masterDryingTimeModel = {
  getMasterDryingTime: async (req, res) => {
    const _id = req.params.id;

    try {
      if (!_id) {
        const response = await MasterDryingTimeModel.findAll();
        res.status(200).json({ data: response });
      } else {
        const response = await MasterDryingTimeModel.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterDryingTime: async (req, res) => {
    const { nama, jam } = req.body;
    if ((!nama, !jam))
      return res.status(404).json({ msg: "incomplete data!!" });

    const t = await db.transaction();

    try {
      const response = await MasterDryingTimeModel.create(
        {
          nama,
          jam,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({ msg: "create successful", data: response });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterDryingTime: async (req, res) => {
    const _id = req.params.id;
    const { nama, jam } = req.body;

    let obj = {};

    if (nama) obj.nama = nama;
    if (jam) obj.jam = jam;
    const t = await db.transaction();

    try {
      await MasterDryingTimeModel.update(obj, {
        where: { id: _id },
        transaction: t,
      }),
        await t.commit();
      res.status(201).json({ msg: "Master update Successful" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterDryingTime: async (req, res) => {
    const _id = req.params.id;
    try {
      await MasterDryingTimeModel.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Master delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterDryingTimeModel;
