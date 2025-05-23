const { Op, Sequelize } = require("sequelize");
const InspeksiChemical = require("../../../../model/qc/inspeksi/chemical/inspeksiChemicalModel");
const InspeksiChemicalPoint = require("../../../../model/qc/inspeksi/chemical/inspeksiChemicalPointModel");
const Users = require("../../../../model/userModel");
const MasterKodeDoc = require("../../../../model/masterData/qc/inspeksi/masterKodeDocModel");
const axios = require("axios");
const dotenv = require("dotenv");
const db = require("../../../../config/database");

dotenv.config();

const inspeksiChemicalController = {
  getInspeksiChemical: async (req, res) => {
    try {
      const { status, page, limit, search, start_date, end_date } = req.query;
      const { id } = req.params;
      let obj = {};

      if (status) obj.status = status;
      if (search)
        obj = {
          [Op.or]: [
            { no_lot: { [Op.like]: `%${search}%` } },
            { no_surat_jalan: { [Op.like]: `%${search}%` } },
            { supplier: { [Op.like]: `%${search}%` } },
            { jenis_chemical: { [Op.like]: `%${search}%` } },
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
      const offset = (parseInt(page) - 1) * parseInt(limit);
      if (page && limit) {
        const data = await InspeksiChemical.findAll({
          include: [
            {
              model: Users,
              as: "inspektor",
            },
          ],
          order: [["createdAt", "DESC"]],
          limit: parseInt(limit),
          offset,
          where: obj,
        });
        const length = await InspeksiChemical.count({ where: obj });
        return res.status(200).json({
          data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (id) {
        const data = await InspeksiChemical.findByPk(id, {
          include: [
            {
              model: InspeksiChemicalPoint,
              as: "inspeksi_chemical_point",
            },
            {
              model: Users,
              as: "inspektor",
            },
          ],
        });

        return res.status(200).json({ data });
      } else {
        const data = await InspeksiChemical.findAll({
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Users,
              as: "inspektor",
            },
          ],
          where: obj,
        });
        return res.status(200).json({ data });
      }
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
  createInspeksiChemical: async (req, res) => {
    const { tanggal, no_surat_jalan, supplier, jenis_chemical } = req.body;
    const t = await db.transaction();
    try {
      if (!tanggal)
        return res.status(400).json({ msg: "Field tanggal kosong!" });
      else if (!no_surat_jalan)
        return res.status(400).json({ msg: "Field no_surat_jalan kosong!" });
      else if (!supplier)
        return res.status(400).json({ msg: "Field supplier kosong!" });
      else if (!jenis_chemical)
        return res.status(400).json({ msg: "Field jenis_chemical kosong!" });

      const data = await InspeksiChemical.create(
        {
          tanggal,
          no_surat_jalan,
          supplier,
          jenis_chemical,
        },
        { transaction: t }
      );

      if (data) {
        const array = [];
        master_result_fix.forEach((value) => {
          value.id_inspeksi_chemical = data.id;
          array.push(value);
        });
        if (array.length == 3) {
          await InspeksiChemicalPoint.bulkCreate(array, { transaction: t });
        }
      }
      await t.commit();
      return res.status(200).json({ data, msg: "OK" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },
  doneInspeksiChemical: async (req, res) => {
    const { id } = req.params;
    const { verifikasi, no_lot, catatan } = req.body;
    const t = await db.transaction();
    try {
      if (!verifikasi)
        return res.status(404).json({ msg: "verifikasi wajib di isi" });
      if (!no_lot) return res.status(404).json({ msg: "no lot wajib di isi" });
      const noDoc = await MasterKodeDoc.findByPk(1);

      await InspeksiChemical.update(
        { status: "history", no_doc: noDoc.kode, catatan, verifikasi, no_lot },
        {
          where: { id: id },
          transaction: t,
        }
      );

      await t.commit();
      return res.status(200).json({ msg: "Update successfully!" });
    } catch (err) {
      await t.rollback();
      res.status(500).json({ msg: err.message });
    }
  },
  deleteInspeksiChemical: async (req, res) => {
    const id = req.params.id;
    try {
      await InspeksiChemical.destroy({ where: { id: id } }),
        res.status(200).json({ msg: "delete successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  startInspeksiChemical: async (req, res) => {
    const id = req.params.id;
    const date = new Date();
    const t = await db.transaction();
    try {
      await InspeksiChemical.update(
        { waktu_mulai: date, id_inspektor: req.user.id },
        { where: { id: id }, transaction: t }
      ),
        await t.commit();
      res.status(200).json({ msg: "start successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
  stopInspeksiChemical: async (req, res) => {
    const id = req.params.id;
    const { hasil, lama_pengerjaan } = req.body;
    const date = new Date();
    const t = await db.transaction();
    try {
      const data = await InspeksiChemical.update(
        {
          waktu_selesai: date,
          lama_pengerjaan,
        },
        {
          where: {
            id: id,
          },
          transaction: t,
        }
      );

      for (let i = 0; i < hasil.length; i++) {
        const data = hasil[i];

        await InspeksiChemicalPoint.update(
          { hasil: data.hasil, keterangan: data.keterangan },
          { where: { id: data.id }, transaction: t }
        );
      }

      await t.commit();
      res.status(200).json({ msg: "stop successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

const master_result_fix = [
  {
    no: 1,
    deskripsi: "MERK",
    standar: "SURAT JALAN",
    metode: "Visual",
  },
  {
    no: 2,
    deskripsi: "KONDISI SEGEL",
    standar: "TERSEGEL RAPI",
    metode: "Visual",
  },
  {
    no: 3,
    deskripsi: "COI",
    standar: "ADA",
    metode: "Visual",
  },
];

module.exports = inspeksiChemicalController;
