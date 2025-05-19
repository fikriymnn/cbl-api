const MasterKapasitasMesin = require("../../../model/masterData/ppic/masterKapasitasMesinModel");

const db = require("../../../config/database");

const masterKapasitasMesin = {
  getMasterKapasitasMesin: async (req, res) => {
    const _id = req.params.id;

    try {
      if (!_id) {
        const response = await MasterKapasitasMesin.findAll();
        res.status(200).json({ data: response });
      } else {
        const response = await MasterKapasitasMesin.findByPk(_id);
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterKapasitasMesin: async (req, res) => {
    const { nama_mesin, kapasitas } = req.body;
    if ((!nama_mesin, !kapasitas))
      return res.status(404).json({ msg: "incomplete data!!" });

    const t = await db.transaction();

    try {
      const response = await MasterKapasitasMesin.create(
        {
          nama_mesin,
          kapasitas,
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

  updateMasterKapasitasMesin: async (req, res) => {
    const _id = req.params.id;
    const { nama_mesin, kapasitas } = req.body;

    let obj = {};

    if (nama_mesin) obj.nama_mesin = nama_mesin;
    if (kapasitas) obj.kapasitas = kapasitas;
    const t = await db.transaction();

    try {
      await MasterKapasitasMesin.update(obj, {
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

  deleteMasterKapasitasMesin: async (req, res) => {
    const _id = req.params.id;
    try {
      await MasterKapasitasMesin.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Master delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterKapasitasMesin;
