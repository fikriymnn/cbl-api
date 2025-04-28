const InspeksiKelengkapanPlate = require("../../../../model/qc/inspeksi/plate/inspeksiKelengkapanPlate");
const Users = require("../../../../model/userModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const { Op, Sequelize } = require("sequelize");

const inspeksiKelengkapanPlateController = {
  getInspeksiKelengkapanPlateMesin: async (req, res) => {
    try {
      const mesin = await InspeksiKelengkapanPlate.findAll({
        attributes: ["mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        where: { status: "incoming" },
        group: ["mesin"],
        order: [[Sequelize.col("count"), "DESC"]],
      });
      res.status(200).json(mesin);
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  getInspeksiKelengkapanPlate: async (req, res) => {
    try {
      const {
        status,
        no_jo,
        mesin,
        page,
        limit,
        search,
        start_date,
        end_date,
      } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (status) obj.status = status;
      if (no_jo) obj.no_jo = no_jo;
      if (mesin) obj.mesin = mesin;
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };
      if (start_date && end_date) {
        obj.createdAt = {
          [Op.between]: [
            new Date(start_date).setHours(0, 0, 0, 0),
            new Date(end_date).setHours(23, 59, 59, 999),
          ],
        };
      } else if (start_date) {
        obj.tgl = {
          [Op.gte]: new Date(start_date).setHours(0, 0, 0, 0), // Set jam startDate ke 00:00:00:00
        };
      } else if (end_date) {
        obj.tgl = {
          [Op.lte]: new Date(end_date).setHours(23, 59, 59, 999),
        };
      }
      if (page && limit) {
        const data = await InspeksiKelengkapanPlate.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await InspeksiKelengkapanPlate.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiKelengkapanPlate.findByPk(id, {
          include: {
            model: Users,
            as: "inspektor",
          },
        });

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiKelengkapanPlate.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          where: obj,
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  checkInspeksiKelengkapanPlate: async (req, res) => {
    const id = req.params.id;
    const { catatan, hasil_check } = req.body;
    const date = new Date();
    try {
      const noDoc = await MasterKodeDoc.findByPk(15);
      await InspeksiKelengkapanPlate.update(
        {
          id_inspektor: req.user.id,
          catatan: catatan,
          hasil_check: hasil_check,
          no_doc: noDoc.kode,
          status: "history",
        },
        { where: { id: id } }
      ),
        res.status(200).json({ msg: "successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = inspeksiKelengkapanPlateController;
