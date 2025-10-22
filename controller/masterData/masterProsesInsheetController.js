const masterProsesInsheet = require("../../model/masterData/masterProsesInsheetModel");
const db = require("../../config/database");

const masterProsesInsheetController = {
  getMasterProsesInsheet: async (req, res) => {
    const _id = req.params.id;
    const { proses, persentase_insheet, page, limit } = req.query;

    let obj = {};
    let offset = (page - 1) * limit;

    if (proses) obj.proses = proses;
    if (persentase_insheet) obj.persentase_insheet = persentase_insheet;

    try {
      if (page & limit) {
        const length_data = await masterProsesInsheet.count({ where: obj });
        const response = await masterProsesInsheet.findAll({
          where: obj,
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        res.status(200).json({
          succes: true,
          status_code: 200,
          data: response,
          total_page: Math.ceil(length_data / limit),
        });
      } else if (_id) {
        const response = await masterProsesInsheet.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await masterProsesInsheet.findAll({ where: obj });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      }
    } catch (error) {
      res
        .status(500)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createMasterProsesInsheet: async (req, res) => {
    const { proses, persentase_insheet } = req.body;

    const t = await db.transaction();

    try {
      const response = await masterProsesInsheet.create(
        {
          proses,
          persentase_insheet,
        },
        { transaction: t }
      );
      await t.commit();
      res.status(200).json({ succes: true, status_code: 200, data: response });
    } catch (error) {
      await t.rollback();
      res
        .status(500)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  updateMasterProsesInsheet: async (req, res) => {
    const _id = req.params.id;
    const { proses, persentase_insheet } = req.body;
    const t = await db.transaction();

    let obj = {};
    if (proses) obj.proses = proses;
    if (persentase_insheet) obj.persentase_insheet = persentase_insheet;

    try {
      await masterProsesInsheet.update(obj, { where: { id: _id } }),
        res.status(201).json({
          succes: true,
          status_code: 200,
          msg: "Update Successfuly",
        });
      await t.commit();
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  deleteMasterProsesInsheet: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      await masterProsesInsheet.update(
        { is_active: false },
        { where: { id: _id } }
      ),
        await t.commit();
      res.status(201).json({ msg: "Delete Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterProsesInsheetController;
