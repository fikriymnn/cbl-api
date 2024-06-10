const masterSparepart = require("../../model/masterData/masterSparepart");
const SparepartProblem = require("../../model/mtc/sparepartProblem");

const masterSparepartController = {
  getMasterSparepart: async (req, res) => {
    const { nama_mesin, posisi_part, kode } = req.query;

    let obj = {};
    if (nama_mesin) obj.nama_mesin = nama_mesin;
    if (posisi_part) obj.posisi_part = posisi_part;
    if (kode) obj.kode = kode;
    console.log(obj);

    try {
      const response = await masterSparepart.findAll({
        where: obj,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  getMasterSparepartById: async (req, res) => {
    try {
      const response = await masterSparepart.findByPk(req.params.id, {
        include: [
          {
            model: SparepartProblem,
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterSparepart: async (req, res) => {
    const {
      id_mesin,
      nama_mesin,
      kode,
      nama_sparepart,
      posisi_part,
      tgl_pasang,
      tgl_rusak,
      umur_a,
      umur_grade,
      grade_2,
      actual_umur,
      sisa_umur,
      keterangan,
    } = req.body;
    if (
      !id_mesin ||
      !nama_mesin ||
      !nama_sparepart ||
      !kode ||
      !posisi_part ||
      !tgl_pasang ||
      !tgl_rusak ||
      !umur_a ||
      !umur_grade ||
      !grade_2 ||
      !actual_umur ||
      !sisa_umur
    )
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await masterSparepart.create({
        id_mesin,
        nama_mesin,
        kode,
        nama_sparepart,
        posisi_part,
        tgl_pasang,
        tgl_rusak,
        umur_a,
        umur_grade,
        grade_2,
        actual_umur,
        sisa_umur,
        keterangan,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterSparepart: async (req, res) => {
    const _id = req.params.id;
    const {
      kode,
      nama_sparepart,
      posisi_part,
      tgl_pasang,
      tgl_rusak,
      umur_a,
      umur_grade,
      grade_2,
      actual_umur,
      sisa_umur,
      keterangan,
    } = req.body;

    let obj = {};
    if (kode) obj.kode = kode;
    if (posisi_part) obj.posisi_part = posisi_part;
    if (nama_sparepart) obj.nama_sparepart = nama_sparepart;
    if (tgl_pasang) obj.tgl_pasang = tgl_pasang;
    if (tgl_rusak) obj.tgl_rusak = tgl_rusak;
    if (umur_a) obj.umur_a = umur_a;
    if (umur_grade) obj.umur_grade = umur_grade;
    if (grade_2) obj.grade_2 = grade_2;
    if (actual_umur) obj.actual_umur = actual_umur;
    if (sisa_umur) obj.sisa_umur = sisa_umur;
    if (keterangan) obj.keterangan = keterangan;

    try {
      await masterSparepart.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Sparepart update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterSparepart: async (req, res) => {
    const _id = req.params.id;
    try {
      await masterSparepart.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Sparepart delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterSparepartController;
