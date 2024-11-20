const masterGrade = require("../../../../model/masterData/hr/masterGrade/masterGradeModel");
const masterGradeColumn = require("../../../../model/masterData/hr/masterGrade/masterGradeColumnModel");
const masterGradeIsi = require("../../../../model/masterData/hr/masterGrade/masterGradeIsiModel");

const db = require("../../../../config/database");

const masterGradeColumnModel = {
  getMasterGradeColumnHr: async (req, res) => {
    const _id = req.params.id;
    try {
      if (_id) {
        const response = await masterGradeColumn.findByPk(_id);
        res.status(200).json(response);
      } else {
        const response = await masterGradeColumn.findAll();
        res.status(200).json({ data: response });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterGradeColumnHr: async (req, res) => {
    const { name } = req.body;
    const t = await db.transaction();

    try {
      const gradeColumn = await masterGradeColumn.create(
        {
          name: name,
        },
        {
          transaction: t,
        }
      );

      const grade = await masterGrade.findAll();

      for (let i = 0; i < grade.length; i++) {
        await masterGradeIsi.create(
          {
            id_grade: grade[i].id,
            id_grade_column: gradeColumn.id,
            bayaran: 0,
          },
          { transaction: t }
        );
      }

      await t.commit();
      res.status(201).json({ msg: "Master Grade Column create Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },

  updateMasterGradeColumnHr: async (req, res) => {
    const _id = req.params.id;
    const { name } = req.body;
    const t = await db.transaction();

    try {
      await masterGradeColumn.update(
        {
          name: name,
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
  deleteMasterGradeColumnHr: async (req, res) => {
    const _id = req.params.id;
    const t = await db.transaction();

    try {
      await masterGradeColumn.destroy({
        where: { id: _id },
        transaction: t,
      });

      await masterGradeIsi.destroy({
        where: { id_grade_column: _id },
        transaction: t,
      });
      await t.commit();
      res.status(201).json({ msg: "Master Grade Column update Successfuly" });
    } catch (error) {
      await t.rollback();
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = masterGradeColumnModel;
