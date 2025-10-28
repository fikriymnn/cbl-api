const { Op } = require("sequelize");
const MasterKodeProduksi = require("../../../model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterKategoriKendala = require("../../../model/masterData/kodeProduksi/masterKategoriKendalaModel");
const MasterKriteriaKendala = require("../../../model/masterData/kodeProduksi/masterKriteriaKendalaModel");
const MasterTahapan = require("../../../model/masterData/tahapan/masterTahapanModel");
const db = require("../../../config/database");

const MasterKodeProduksiController = {
  getMasterKodeProduksi: async (req, res) => {
    const _id = req.params.id;
    const {
      is_active,
      id_tahapan_produksi,
      id_kriteria_qty_produksi,
      id_kriteria_qty_qc,
      id_kriteria_qty_mtc,
      id_kriteria_waktu_produksi,
      id_kriteria_waktu_qc,
      id_kriteria_waktu_mtc,
      id_kriteria_frekuensi_produksi,
      id_kriteria_frekuensi_qc,
      id_kriteria_frekuensi_mtc,
      id_kategori_kendala,
      page,
      limit,
      search,
    } = req.query;

    try {
      let obj = {};
      const offset = (page - 1) * limit;

      if (search) {
        obj = {
          [Op.or]: [{ proses_produksi: { [Op.like]: `%${search}%` } }],
          [Op.or]: [{ kode: { [Op.like]: `%${search}%` } }],
          [Op.or]: [{ deskripsi: { [Op.like]: `%${search}%` } }],
        };
      }
      if (id_tahapan_produksi) obj.id_tahapan_produksi = id_tahapan_produksi;
      if (id_kriteria_qty_produksi)
        obj.id_kriteria_qty_produksi = id_kriteria_qty_produksi;
      if (id_kriteria_qty_qc) obj.id_kriteria_qty_qc = id_kriteria_qty_qc;
      if (id_kriteria_qty_mtc) obj.id_kriteria_qty_mtc = id_kriteria_qty_mtc;
      if (id_kriteria_waktu_produksi)
        obj.id_kriteria_waktu_produksi = id_kriteria_waktu_produksi;
      if (id_kriteria_waktu_qc) obj.id_kriteria_waktu_qc = id_kriteria_waktu_qc;
      if (id_kriteria_waktu_mtc)
        obj.id_kriteria_waktu_mtc = id_kriteria_waktu_mtc;
      if (id_kriteria_frekuensi_produksi)
        obj.id_kriteria_frekuensi_produksi = id_kriteria_frekuensi_produksi;
      if (id_kriteria_frekuensi_qc)
        obj.id_kriteria_frekuensi_qc = id_kriteria_frekuensi_qc;
      if (id_kriteria_frekuensi_mtc)
        obj.id_kriteria_frekuensi_mtc = id_kriteria_frekuensi_mtc;
      if (id_kategori_kendala) obj.id_kategori_kendala = id_kategori_kendala;
      if (is_active) obj.is_active = is_active == "true" ? true : false;
      if (page && limit) {
        const length = await MasterKodeProduksi.count({ where: obj });
        const data = await MasterKodeProduksi.findAll({
          where: obj,
          offset: parseInt(offset),
          limit: parseInt(limit),
          include: [
            {
              model: MasterTahapan,
              as: "tahapan",
            },
            {
              model: MasterKategoriKendala,
              as: "kategori_kendala",
            },
          ],
        });
        return res.status(200).json({
          succes: true,
          status_code: 200,
          data: data,
          total_page: Math.ceil(length / parseInt(limit)),
        });
      } else if (_id) {
        const response = await MasterKodeProduksi.findByPk(_id, {
          include: [
            {
              model: MasterTahapan,
              as: "tahapan",
            },
            {
              model: MasterKategoriKendala,
              as: "kategori_kendala",
            },
            //kriteria qty produksi
            {
              model: MasterKriteriaKendala,
              as: "kriteria_qty_produksi",
            },
            //kriteria qty qc
            {
              model: MasterKriteriaKendala,
              as: "kriteria_qty_qc",
            },
            //kriteria qty mtc
            {
              model: MasterKriteriaKendala,
              as: "kriteria_qty_mtc",
            },
            //kriteria waktu produksi
            {
              model: MasterKriteriaKendala,
              as: "kriteria_waktu_produksi",
            },
            //kriteria waktu qc
            {
              model: MasterKriteriaKendala,
              as: "kriteria_waktu_qc",
            },
            //kriteria waktu mtc
            {
              model: MasterKriteriaKendala,
              as: "kriteria_waktu_mtc",
            },
            //kriteria frekuensi produksi
            {
              model: MasterKriteriaKendala,
              as: "kriteria_frekuensi_produksi",
            },
            //kriteria frekuensi qc
            {
              model: MasterKriteriaKendala,
              as: "kriteria_frekuensi_qc",
            },
            //kriteria frekuensi mtc
            {
              model: MasterKriteriaKendala,
              as: "kriteria_frekuensi_mtc",
            },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      } else {
        const response = await MasterKodeProduksi.findAll({
          where: obj,
          include: [
            {
              model: MasterTahapan,
              as: "tahapan",
            },
            {
              model: MasterKategoriKendala,
              as: "kategori_kendala",
            },
          ],
        });
        res
          .status(200)
          .json({ succes: true, status_code: 200, data: response });
      }
    } catch (error) {
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  createMasterKodeProduksi: async (req, res) => {
    const {
      proses_produksi,
      kode,
      deskripsi,
      id_tahapan_produksi,
      id_kriteria_qty_produksi,
      id_kriteria_qty_qc,
      id_kriteria_qty_mtc,
      id_kriteria_waktu_produksi,
      id_kriteria_waktu_qc,
      id_kriteria_waktu_mtc,
      id_kriteria_frekuensi_produksi,
      id_kriteria_frekuensi_qc,
      id_kriteria_frekuensi_mtc,
      id_kategori_kendala,
      target_department,
    } = req.body;
    const t = await db.transaction();
    if (!proses_produksi)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "proses produksi wajib di isi!!",
      });

    if (!kode)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "kode wajib di isi!!",
      });

    if (!id_tahapan_produksi)
      return res.status(404).json({
        succes: false,
        status_code: 404,
        msg: "tahapan produksi wajib di isi!!",
      });

    try {
      const response = await MasterKodeProduksi.create(
        {
          proses_produksi,
          kode,
          deskripsi,
          id_tahapan_produksi,
          id_kriteria_qty_produksi,
          id_kriteria_qty_qc,
          id_kriteria_qty_mtc,
          id_kriteria_waktu_produksi,
          id_kriteria_waktu_qc,
          id_kriteria_waktu_mtc,
          id_kriteria_frekuensi_produksi,
          id_kriteria_frekuensi_qc,
          id_kriteria_frekuensi_mtc,
          id_kategori_kendala,
          target_department,
        },
        { transaction: t }
      );
      await t.commit();
      return res.status(200).json({
        succes: true,
        status_code: 200,
        msg: "Create Successful",
        data: response,
      });
    } catch (error) {
      await t.rollback();
      return res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },

  updateMasterKodeProduksi: async (req, res) => {
    const _id = req.params.id;
    const {
      proses_produksi,
      kode,
      deskripsi,
      id_tahapan_produksi,
      id_kriteria_qty_produksi,
      id_kriteria_qty_qc,
      id_kriteria_qty_mtc,
      id_kriteria_waktu_produksi,
      id_kriteria_waktu_qc,
      id_kriteria_waktu_mtc,
      id_kriteria_frekuensi_produksi,
      id_kriteria_frekuensi_qc,
      id_kriteria_frekuensi_mtc,
      id_kategori_kendala,
      target_department,
    } = req.body;
    const t = await db.transaction();

    try {
      let obj = {};
      if (proses_produksi) obj.proses_produksi = proses_produksi;
      if (kode) obj.kode = kode;
      if (deskripsi) obj.deskripsi = deskripsi;
      if (id_tahapan_produksi) obj.id_tahapan_produksi = id_tahapan_produksi;
      if (id_kriteria_qty_produksi)
        obj.id_kriteria_qty_produksi = id_kriteria_qty_produksi;
      if (id_kriteria_qty_qc) obj.id_kriteria_qty_qc = id_kriteria_qty_qc;
      if (id_kriteria_qty_mtc) obj.id_kriteria_qty_mtc = id_kriteria_qty_mtc;
      if (id_kriteria_waktu_produksi)
        obj.id_kriteria_waktu_produksi = id_kriteria_waktu_produksi;
      if (id_kriteria_waktu_qc) obj.id_kriteria_waktu_qc = id_kriteria_waktu_qc;
      if (id_kriteria_waktu_mtc)
        obj.id_kriteria_waktu_mtc = id_kriteria_waktu_mtc;
      if (id_kriteria_frekuensi_produksi)
        obj.id_kriteria_frekuensi_produksi = id_kriteria_frekuensi_produksi;
      if (id_kriteria_frekuensi_qc)
        obj.id_kriteria_frekuensi_qc = id_kriteria_frekuensi_qc;
      if (id_kriteria_frekuensi_mtc)
        obj.id_kriteria_frekuensi_mtc = id_kriteria_frekuensi_mtc;
      if (id_kategori_kendala) obj.id_kategori_kendala = id_kategori_kendala;
      if (target_department) obj.target_department = target_department;

      const checkData = await MasterKodeProduksi.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterKodeProduksi.update(obj, {
        where: { id: _id },
        transaction: t,
      });
      await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Update Successful" });
    } catch (error) {
      await t.rollback();
      res
        .status(400)
        .json({ succes: false, status_code: 400, msg: error.message });
    }
  },

  deleteMasterKodeProduksi: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();
    try {
      const checkData = await MasterKodeProduksi.findByPk(_id);
      if (!checkData)
        return res.status(404).json({
          succes: false,
          status_code: 404,
          msg: "Data tidak ditemukan",
        });
      await MasterKodeProduksi.update(
        { is_active: false },
        {
          where: { id: _id },
          transaction: t,
        }
      ),
        await t.commit(),
        res
          .status(200)
          .json({ succes: true, status_code: 200, msg: "Delete Successful" });
    } catch (error) {
      res
        .status(400)
        .json({ succes: true, status_code: 400, msg: error.message });
    }
  },
};

module.exports = MasterKodeProduksiController;
