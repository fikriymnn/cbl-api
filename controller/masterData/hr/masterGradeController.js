const masterGrade = require("../../../model/masterData/hr/masterGradeModel");
const db = require("../../../config/database");

const masterGradeModel = {
  getMasterGradeHr: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterGrade.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterGrade.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterGradeHr: async (req, res) => {
    const {
      kategori,
      lembur_biasa,
      lembur_libur,
      tunjangan_jabatan,
      uang_hadir,
      uang_makan_lembur,
      tunjangan_kopi,
      tunjangan_kerja_malam,
      uang_dinas,
      uang_kawal,
      uang_ongkos_pulang,
      insentif,
    } = req.body;
    const t = await db.transaction();

    try {
      const grade = await masterGrade.create(
        {
          kategori,
          lembur_biasa,
          lembur_libur,
          tunjangan_jabatan,
          uang_hadir,
          uang_makan_lembur,
          tunjangan_kopi,
          tunjangan_kerja_malam,
          uang_dinas,
          uang_kawal,
          uang_ongkos_pulang,
          insentif,
        },
        {
          transaction: t,
        }
      );

      await t.commit();
      res.status(201).json({ msg: "Master Grade create Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterGradeHr: async (req, res) => {
    const _id = req.params.id;
    const {
      kategori,
      lembur_biasa,
      lembur_libur,
      tunjangan_jabatan,
      uang_hadir,
      uang_makan_lembur,
      tunjangan_kopi,
      tunjangan_kerja_malam,
      uang_dinas,
      uang_kawal,
      uang_ongkos_pulang,
      insentif,
    } = req.body;
    const t = await db.transaction();

    try {
      const grade = await masterGrade.update(
        {
          kategori,
          lembur_biasa,
          lembur_libur,
          tunjangan_jabatan,
          uang_hadir,
          uang_makan_lembur,
          tunjangan_kopi,
          tunjangan_kerja_malam,
          uang_dinas,
          uang_kawal,
          uang_ongkos_pulang,
          insentif,
        },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      await t.commit();
      res.status(201).json({ msg: "Master Grade update Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterGradeModel;
