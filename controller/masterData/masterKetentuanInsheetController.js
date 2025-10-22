const masterKetentuanInsheet = require("../../model/masterData/masterKetentuanInsheetModel");
const db = require("../../config/database");

const masterKetentuanInsheetController = {
  getMasterKetentuanInsheet: async (req, res) => {
    const _id = req.params.id;
    const {
      deskripsi,
      batas_bawah,
      batas_atas,
      nilai,
      is_persentase,
      page,
      limit,
    } = req.query;

    let obj = {};
    let offset = (page - 1) * limit;

    if (deskripsi) obj.deskripsi = deskripsi;
    if (batas_bawah) obj.batas_bawah = batas_bawah;
    if (batas_atas) obj.batas_atas = batas_atas;
    if (nilai) obj.nilai = nilai;
    if (is_persentase) obj.is_persentase = kode_mesin;

    try {
      if (page & limit) {
        const length_data = await masterKetentuanInsheet.count({ where: obj });
        const response = await masterKetentuanInsheet.findAll({
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
        const response = await masterKetentuanInsheet.findByPk(_id);
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await masterKetentuanInsheet.findAll({ where: obj });
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

  createMasterKetentuanInsheet: async (req, res) => {
    const { deskripsi, batas_atas, batas_bawah, nilai, is_persentase } =
      req.body;

    const t = await db.transaction();

    try {
      const response = await masterKetentuanInsheet.create(
        {
          deskripsi,
          batas_atas,
          batas_bawah,
          nilai,
          is_persentase,
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

  updateMasterKetentuanInsheet: async (req, res) => {
    const _id = req.params.id;
    const { deskripsi, batas_atas, batas_bawah, nilai, is_persentase } =
      req.body;
    const t = await db.transaction();

    let obj = {};
    if (deskripsi) obj.deskripsi = deskripsi;
    if (batas_atas) obj.batas_atas = batas_atas;
    if (batas_bawah) obj.batas_bawah = batas_bawah;
    if (nilai) obj.nilai = nilai;
    if (is_persentase) obj.is_persentase = is_persentase;

    try {
      await masterKetentuanInsheet.update(obj, { where: { id: _id } }),
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

  deleteMasterKetentuanInsheet: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      await masterKetentuanInsheet.update(
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

module.exports = masterKetentuanInsheetController;
