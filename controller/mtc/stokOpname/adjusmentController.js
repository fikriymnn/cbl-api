const { Sequelize, where } = require("sequelize");
const StokSparepart = require("../../../model/mtc/stokSparepart");
const AdjusmentSparepart = require("../../../model/mtc/stokOpname/adjusmentSparepartModel");
const Users = require("../../../model/userModel");
const { Op } = require("sequelize");
const db = require("../../../config/database");
const AdjusmentSparepartController = {
  getAdjusmentSparepart: async (req, res) => {
    const _id = req.params.id;
    const { id_user, id_stok_sparepart, status, limit, page } = req.query;

    let offset = (page - 1) * limit;
    let obj = {};

    if (id_stok_sparepart) obj.id_stok_sparepart = id_stok_sparepart;
    if (id_user) obj.id_user = id_user;
    if (status) obj.status = status;

    try {
      if (page && limit) {
        const length_data = await AdjusmentSparepart.count({ where: obj });
        const response = await AdjusmentSparepart.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: StokSparepart,
              as: "sparepart",
            },
            { model: Users, as: "user" },
          ],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        res.status(200).json({
          data: response,
          total_page: Math.ceil(length_data / limit),
          offset: page,
          limit: limit,
        });
      } else if (_id) {
        const response = await AdjusmentSparepart.findByPk(_id, {
          include: [
            {
              model: StokSparepart,
              as: "sparepart",
            },
            { model: Users, as: "user" },
          ],
        });
        res.status(200).json({ data: response });
      } else {
        const response = await AdjusmentSparepart.findAll({
          order: [["createdAt", "DESC"]],
          where: obj,
          include: [
            {
              model: StokSparepart,
              as: "sparepart",
            },
            { model: Users, as: "user" },
          ],
        });
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createAdjusmentSparepart: async (req, res) => {
    const { id_stok_sparepart, qty, note } = req.body;

    if (!id_stok_sparepart)
      return res.status(400).json({ msg: "stok required" });
    if (!qty) return res.status(400).json({ msg: "qty required" });
    const checkQtyNumber = Number.isInteger(qty);
    if (!checkQtyNumber)
      return res.status(400).json({ msg: "qty must be number" });
    const t = await db.transaction();

    try {
      const sparepart = await StokSparepart.findByPk(id_stok_sparepart);
      if (!sparepart) return res.status(404).json({ msg: "stok not found" });
      const penguranganPenambahan = qty >= 0 ? "+" : "-";
      const newStok = sparepart.stok + qty;

      await AdjusmentSparepart.create(
        {
          id_stok_sparepart: sparepart.id,
          id_user: req.user.id,
          pengurangan_penambahan: penguranganPenambahan,
          stok_terakhir: sparepart.stok,
          qty: qty,
          tgl_adjusment: new Date(),
          note: note,
          status: "history",
        },
        { transaction: t }
      );
      await StokSparepart.update(
        { stok: newStok },
        { where: { id: sparepart.id }, transaction: t }
      );
      await t.commit();
      res.status(200).json({ msg: "Sparepart Requested Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = AdjusmentSparepartController;
