const masterIstirahat = require("../../../../model/masterData/hr/masterShift/masterIstirahatModel");
const db = require("../../../../config/database");

const masterIstirahatController = {
  getMasteristirahat: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterIstirahat.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterIstirahat.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasteristirahat: async (req, res) => {
    const { data_istirahat, id_shift, dari, sampai, nama } = req.body;

    for (let i = 0; i < data_istirahat.length; i++) {
      const data = data_istirahat[i];
      if ((!data.id_shift, !data.dari, !data.sampai, !data.nama))
        return res.status(400).json({ msg: "Incomplite data" });
    }

    const t = await db.transaction();

    try {
      await masterIstirahat.bulkCreate(data_istirahat, { transaction: t }),
        await t.commit();
      res.status(200).json({ msg: "istirahat create Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasteristirahat: async (req, res) => {
    const _id = req.params.id;
    const { data_istirahat, dari, sampai, nama } = req.body;

    for (let i = 0; i < data_istirahat.length; i++) {
      const data = data_istirahat[i];
      if ((!data.id, !data.dari, !data.sampai, !data.nama))
        return res.status(400).json({ msg: "Incomplite data" });
    }

    const t = await db.transaction();

    try {
      for (let i = 0; i < data_istirahat.length; i++) {
        const data = data_istirahat[i];
        await masterIstirahat.update(
          { dari: data.dari, sampai: data.sampai, nama: data.nama },
          { where: { id: data.id }, transaction: t }
        );
      }

      await t.commit();
      res.status(201).json({ msg: "istirahat update Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasteristirahat: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      await masterIstirahat.destroy({ where: { id: _id }, transaction: t }),
        await t.commit();
      res.status(201).json({ msg: "istirahat update Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterIstirahatController;
