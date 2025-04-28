const MasterKodeDocInspeksi = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const db = require("../../../../config/database");

const MasterKodeDocInspeksiController = {
  getMasterKodeDocInspeksi: async (req, res) => {
    // const {}
    const _id = req.params.id;
    const { kode, inspeksi_name } = req.query;

    let obj = {};

    if (kode) obj.kode = kode;
    if (inspeksi_name) obj.inspeksi_name = inspeksi_name;

    try {
      if (!_id) {
        const response = await MasterKodeDocInspeksi.findAll({
          where: obj,
        });
        res.status(200).json({ data: response });
      } else {
        const response = await MasterKodeDocInspeksi.findByPk(_id);
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKodeDocInspeksi: async (req, res) => {
    const { kode, inspeksi_name } = req.body;
    if (!kode || !inspeksi_name)
      return res.status(404).json({ msg: "incomplete data!!" });
    const t = await db.transaction();

    try {
      const response = await MasterKodeDocInspeksi.create(
        {
          kode,
          inspeksi_name,
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

  updateMasterKodeDocInspeksi: async (req, res) => {
    const _id = req.params.id;
    const { kode, inspeksi_name } = req.body;

    let obj = {};
    if (kode) obj.kode = kode;
    if (inspeksi_name) obj.inspeksi_name = inspeksi_name;
    const t = await db.transaction();

    try {
      await MasterKodeDocInspeksi.update(obj, {
        where: { id: _id },
        transaction: t,
      }),
        await t.commit();
      res.status(201).json({ msg: "kode update Successful" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterKodeDocInspeksi: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      await MasterKodeDocInspeksi.destroy({
        where: { id: _id },
        transaction: t,
      }),
        await t.commit();
      res.status(201).json({ msg: "kode delete Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = MasterKodeDocInspeksiController;
