const masterGrade = require("../../../../model/masterData/hr/masterGrade/masterGradeModel");
const masterGradeColumn = require("../../../../model/masterData/hr/masterGrade/masterGradeColumnModel");
const masterGradeIsi = require("../../../../model/masterData/hr/masterGrade/masterGradeIsiModel");

const db = require("../../../../config/database");

const masterGradeModel = {
  getMasterGradeHr: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterGrade.findByPk(_id, {
          include: [
            {
              model: masterGradeIsi,
              as: "isi_grade",
              include: [
                {
                  model: masterGradeColumn,
                  as: "grade_column",
                },
              ],
            },
          ],
        });
        res.status(200).json(response);
      } else {
        const response = await masterGrade.findAll({
          include: [
            {
              model: masterGradeIsi,
              as: "isi_grade",
              include: [
                {
                  model: masterGradeColumn,
                  as: "grade_column",
                },
              ],
            },
          ],
        });
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterGradeHr: async (req, res) => {
    const { kategori, grade_isi } = req.body;
    const t = await db.transaction();

    try {
      const grade = await masterGrade.create(
        { kategori },
        {
          transaction: t,
        }
      );
      for (let i = 0; i < grade_isi.length; i++) {
        await masterGradeIsi.create(
          {
            id_grade: grade.id,
            id_grade_column: grade_isi[i].id,
            bayaran: grade_isi[i].bayaran,
          },
          {
            transaction: t,
          }
        );
      }

      await t.commit();
      res.status(201).json({ msg: "Master Grade create Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterGradeHr: async (req, res) => {
    const _id = req.params.id;
    const { kategori, grade_isi } = req.body;
    const t = await db.transaction();

    try {
      const grade = await masterGrade.update(
        { kategori },
        {
          where: { id: _id },
          transaction: t,
        }
      );

      for (let i = 0; i < grade_isi.length; i++) {
        await masterGradeIsi.update(
          {
            bayaran: grade_isi[i].bayaran,
          },
          {
            where: { id: grade_isi[i].id },
            transaction: t,
          }
        );
      }
      await t.commit();
      res.status(201).json({ msg: "Master Grade update Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterGradeModel;
