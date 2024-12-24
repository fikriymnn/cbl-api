const MasterkategoriSettingKapisitasModel = require("../../../model/masterData/ppic/masterKategoriSettingKapasitasModel");
const MasterMesin = require("../../../model/masterData/masterMesinModel");
const db = require("../../../config/database");

const masterkategoriSettingKapisitasModel = {
  getMasterkategoriSettingKapisitasModel: async (req, res) => {
    // const {}
    const _id = req.params.id;

    try {
      if (!_id) {
        const response = await MasterkategoriSettingKapisitasModel.findAll();
        res.status(200).json({ data: response });
      } else {
        const response = await MasterkategoriSettingKapisitasModel.findByPk(
          _id
        );
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterkategoriSettingKapisitasModel: async (req, res) => {
    const {
      id_mesin,
      nama_kategori,
      setting_a,
      setting_b,
      setting_c,
      kapasitas_a,
      kapasitas_b,
      kapasitas_c,
    } = req.body;
    if (
      (!id_mesin,
      !nama_kategori || !setting_a,
      !setting_b,
      !setting_c,
      !kapasitas_a,
      !kapasitas_b,
      !kapasitas_c)
    )
      return res.status(404).json({ msg: "incomplete data!!" });
    const masterMesin = await MasterMesin.findByPk(id_mesin);

    if (!masterMesin)
      return res.status(404).json({ msg: "master mesin not found" });

    const t = await db.transaction();

    try {
      const response = await MasterkategoriSettingKapisitasModel.create(
        {
          id_mesin,
          nama_mesin: masterMesin.nama_mesin,
          nama_kategori,
          setting_a,
          setting_b,
          setting_c,
          kapasitas_a,
          kapasitas_b,
          kapasitas_c,
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

  updateMasterkategoriSettingKapisitasModel: async (req, res) => {
    const _id = req.params.id;
    const {
      id_mesin,
      nama_kategori,
      setting_a,
      setting_b,
      setting_c,
      kapasitas_a,
      kapasitas_b,
      kapasitas_c,
    } = req.body;

    let obj = {};

    if (id_mesin) {
      const masterMesin = await MasterMesin.findByPk(id_mesin);
      if (!masterMesin)
        return res.status(404).json({ msg: "master mesin not found" });
      obj.id_mesin = id_mesin;
      obj.nama_mesin = masterMesin.nama_mesin;
    }
    if (nama_kategori) obj.nama_kategori = nama_kategori;
    if (setting_a) obj.setting_a = setting_a;
    if (setting_b) obj.setting_b = setting_b;
    if (setting_c) obj.setting_c = setting_c;
    if (kapasitas_a) obj.kapasitas_a = kapasitas_a;
    if (kapasitas_b) obj.kapasitas_b = kapasitas_b;
    if (kapasitas_c) obj.kapasitas_c = kapasitas_c;
    const t = await db.transaction();

    try {
      await MasterkategoriSettingKapisitasModel.update(obj, {
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

  deleteMasterkategoriSettingKapisitasModel: async (req, res) => {
    const _id = req.params.id;
    try {
      await MasterkategoriSettingKapisitasModel.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Machine delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterkategoriSettingKapisitasModel;
