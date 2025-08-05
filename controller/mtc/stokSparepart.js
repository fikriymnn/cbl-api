const { Sequelize, where } = require("sequelize");
const StokSparepart = require("../../model/mtc/stokSparepart");
const RequestStokSparepart = require("../../model/mtc/spbStokSparepart");
const MasterMesin = require("../../model/masterData/masterMesinModel");
const MasterGrade = require("../../model/masterData/mtc/masterGradeModel");
const StokSparepartController = {
  getStokSparepart: async (req, res) => {
    const {
      id_mesin,
      kode,
      nama_sparepart,
      stok,
      part_number,
      lokasi,
      grade,
      type_part,
      limit,
      page,
    } = req.query;

    let offset = (page - 1) * limit;
    let obj = {};
    if (id_mesin) obj.id_mesin = id_mesin;
    if (kode) obj.kode = kode;
    if (nama_sparepart) obj.nama_sparepart = nama_sparepart;
    if (stok) obj.stok = stok;
    if (part_number) obj.part_number = part_number;
    if (lokasi) obj.lokasi = lokasi;
    if (grade) obj.grade = grade;
    if (type_part) obj.type_part = type_part;
    try {
      if (page && limit) {
        const length_data = await StokSparepart.count({ where: obj });
        const response = await StokSparepart.findAll({
          order: [["kode", "ASC"]],
          where: obj,
          include: [
            {
              model: MasterMesin,
              as: "mesin",
            },
          ],

          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        res
          .status(200)
          .json({ data: response, total_page: Math.ceil(length_data / limit) });
      } else {
        const response = await StokSparepart.findAll({
          order: [["kode", "ASC"]],
          where: obj,
          include: [
            {
              model: MasterMesin,
              as: "mesin",
            },
          ],
        });
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getStokSparepartById: async (req, res) => {
    try {
      const response = await StokSparepart.findByPk(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createStokSparepart: async (req, res) => {
    const {
      kode,
      nama_sparepart,
      id_mesin,
      stok,
      part_number,
      lokasi,
      limit_stok,
      grade,
      percent,
      type_part,
      foto,
      keterangan,
      umur_sparepart,
      id_grade,
      file,
    } = req.body;

    if (!nama_sparepart || !id_mesin || !umur_sparepart)
      return res.status(404).json({ msg: "incomplete data!!" });

    const masterGrade = await MasterGrade.findByPk(parseInt(id_grade));

    if (!masterGrade)
      return res.status(404).json({ msg: "Master Grade not found" });

    try {
      const response = await StokSparepart.create({
        kode,
        nama_sparepart,
        id_mesin,
        stok: !stok ? 0 : stok,
        part_number,
        lokasi,
        limit_stok,
        grade: masterGrade.grade,
        percent: masterGrade.percent,
        type_part,
        file,
        keterangan,
        umur_sparepart,
      });
      // await RequestStokSparepart.create({
      //   id_sparepart: response.id,
      //   stok: stok,
      //   kode,
      //   nama_sparepart,
      //   nama_mesin,
      //   jenis_part,
      //   persen,
      //   kebutuhan_bulanan,
      //   keterangan,
      //   umur_sparepart,
      //   vendor,
      //   req_sparepart_baru: true,
      // });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateStokSparepart: async (req, res) => {
    const _id = req.params.id;
    const {
      kode,
      nama_sparepart,
      id_mesin,
      jenis_part,
      persen,
      kebutuhan_bulanan,
      stok,
      keterangan,
      umur_sparepart,
      vendor,
      part_number,
      lokasi,
      limit_stok,
      file,
    } = req.body;

    let obj = {};
    if (kode) obj.kode = kode;
    if (nama_sparepart) obj.nama_sparepart = nama_sparepart;
    if (id_mesin) obj.id_mesin = id_mesin;
    if (umur_sparepart) obj.umur_sparepart = umur_sparepart;
    if (jenis_part) obj.jenis_part = jenis_part;
    if (persen) obj.persen = persen;
    if (kebutuhan_bulanan) obj.kebutuhan_bulanan = kebutuhan_bulanan;
    if (stok) obj.stok = stok;
    if (keterangan) obj.keterangan = keterangan;
    if (vendor) obj.vendor = vendor;
    if (part_number) obj.part_number = part_number;
    if (lokasi) obj.lokasi = lokasi;
    if (limit_stok) obj.limit_stok = limit_stok;
    if (file) obj.file = file;

    try {
      await StokSparepart.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Sparepart update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteStokSparepart: async (req, res) => {
    const _id = req.params.id;
    try {
      await StokSparepart.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Sparepart delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  approveRequestStokSparepart: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const request = await RequestStokSparepart.findByPk(_id);
      await RequestStokSparepart.update(
        { status: "approve", note: note },
        { where: { id: _id } }
      );

      const sparepart = await StokSparepart.findByPk(request.id_sparepart);
      const stok_sparepart = sparepart.stok + request.qty;

      await StokSparepart.update(
        { stok: stok_sparepart },
        { where: { id: request.id_sparepart } }
      ),
        res.status(201).json({ msg: "Request Stok Sparepart Approved" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  tolakRequestStokSparepart: async (req, res) => {
    const _id = req.params.id;
    const { note } = req.body;

    try {
      const request = await RequestStokSparepart.findByPk(_id);
      await RequestStokSparepart.update(
        { status: "tolak", note: note },
        { where: { id: _id } }
      );

      if (request.req_sparepart_baru == true) {
        await StokSparepart.destroy({ where: { id: request.id_sparepart } });
      }

      res.status(201).json({ msg: "Request Stok Sparepart di Tolak" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  addStokSparepart: async (req, res) => {
    const _id = req.params.id;
    const { new_stok } = req.body;

    if (!new_stok) return res.status(404).json({ msg: "stok required" });

    try {
      const sparepart = await StokSparepart.findByPk(_id);

      await RequestStokSparepart.create({
        id_stok_sparepart: sparepart.id,
        qty: new_stok,
      });
      res.status(201).json({ msg: "Sparepart Requested Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = StokSparepartController;
