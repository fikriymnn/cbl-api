const InspeksiPrePress = require("../../../../model/qc/inspeksi/plate/inspeksiPrePressModel");
const InspeksiPraPlate = require("../../../../model/qc/inspeksi/plate/inspeksiPraPlateModel");
const InspeksiKelengkapanPlate = require("../../../../model/qc/inspeksi/plate/inspeksiKelengkapanPlate");
const InspeksiPraPlateResult = require("../../../../model/qc/inspeksi/plate/inspeksiPraPlateResultModel");
const Users = require("../../../../model/userModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");

const { Op, Sequelize } = require("sequelize");

const inspeksiPrePressController = {
  getInspeksiPrePressMesin: async (req, res) => {
    try {
      const mesin = await InspeksiPrePress.findAll({
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

  getInspeksiPrePress: async (req, res) => {
    try {
      const { status, no_jo, mesin, page, limit, search } = req.query;
      const { id } = req.params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      let obj = {};
      if (search)
        obj = {
          [Op.or]: [
            { no_jo: { [Op.like]: `%${search}%` } },
            { no_io: { [Op.like]: `%${search}%` } },
            { nama_produk: { [Op.like]: `%${search}%` } },
            { customer: { [Op.like]: `%${search}%` } },
          ],
        };
      if (page && limit && (status || no_jo || mesin)) {
        if (status) obj.status = status;
        if (no_jo) obj.no_jo = no_jo;
        if (mesin) obj.mesin = mesin;
        const data = await InspeksiPrePress.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await InspeksiPrePress.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (page && limit) {
        const data = await InspeksiPrePress.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          offset,
          limit: parseInt(limit),
        });
        const length = await InspeksiPrePress.count();
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (status || no_jo || mesin) {
        if (status) obj.status = status;
        if (no_jo) obj.no_jo = no_jo;
        if (mesin) obj.mesin = mesin;

        const data = await InspeksiPrePress.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
          where: obj,
        });
        const length = await InspeksiPrePress.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiPrePress.findByPk(id, {
          include: {
            model: Users,
            as: "inspektor",
          },
        });

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiPrePress.findAll({
          order: [["createdAt", "DESC"]],
          include: {
            model: Users,
            as: "inspektor",
          },
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  checkInspeksiPrePress: async (req, res) => {
    const id = req.params.id;
    const { catatan, hasil_check } = req.body;
    const date = new Date();
    try {
      const PressProses = await InspeksiPrePress.findByPk(id);
      const noDoc = await MasterKodeDoc.findByPk(16);
      await InspeksiPrePress.update(
        {
          id_inspektor: req.user.id,
          catatan: catatan,
          hasil_check: hasil_check,
          status: "history",
          no_doc: noDoc.kode,
        },
        { where: { id: id } }
      );

      if (PressProses.status_jo == "REPEAT") {
        await InspeksiKelengkapanPlate.create({
          status_jo: PressProses.status_jo,
          tanggal: PressProses.tanggal,
          no_io: PressProses.no_io,
          no_jo: PressProses.no_jo,
          nama_produk: PressProses.nama_produk,
          jam: PressProses.jam,
          customer: PressProses.customer,
          mesin: PressProses.mesin,
          keterangan: PressProses.keterangan,
          total_warna: PressProses.total_warna,
          qty_jo: PressProses.qty_jo,
        });
      } else {
        const data = await InspeksiPraPlate.create({
          status_jo: PressProses.status_jo,
          tanggal: PressProses.tanggal,
          no_io: PressProses.no_io,
          no_jo: PressProses.no_jo,
          nama_produk: PressProses.nama_produk,
          jam: PressProses.jam,
          customer: PressProses.customer,
          mesin: PressProses.mesin,
          keterangan: PressProses.keterangan,
          total_warna: PressProses.total_warna,
          qty_jo: PressProses.qty_jo,
        });

        if (data) {
          let array = [];

          master_data_fix.forEach((value) => {
            value.id_inspeksi_pra_plate = data.id;
            array.push(value);
          });

          if (array.length == 5) {
            await InspeksiPraPlateResult.bulkCreate(array);
          }
        }
      }
      res.status(200).json({ msg: "successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

const master_data_fix = [
  {
    no: 1,
    point_check: "Redaksi",
    acuan: "Acc Artwork",
  },
  {
    no: 2,
    point_check: "Design",
    acuan: "Acc Artwork",
  },
  {
    no: 3,
    point_check: "Bleed",
    acuan: "Film Pisau",
  },
  {
    no: 4,
    point_check: "Mounting",
    acuan: "Job Order",
  },
  {
    no: 5,
    point_check: "Kross Potong",
    acuan: "Berdasarkan Potong Bahan",
  },
];

module.exports = inspeksiPrePressController;
