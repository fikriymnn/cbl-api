const MasterGrade = require("../../../model/masterData/mtc/masterGradeModel");

const MasterGradeController = {
  getMasterGrade: async (req, res) => {
    const _id = req.params.id;

    try {
      if (_id) {
        const response = await MasterGrade.findAll({ where: { id: _id } });
        res.status(200).json(response);
      } else {
        const response = await MasterGrade.findAll();
        res.status(200).json(response);
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  createMasterGrade: async (req, res) => {
    const { grade, percent } = req.body;
    if (!grade || !percent)
      return res.status(404).json({ msg: "incomplete data!!" });

    try {
      const response = await MasterGrade.create({
        grade,
        percent,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  updateMasterGrade: async (req, res) => {
    const _id = req.params.id;
    const { grade, percent } = req.body;

    let obj = {};
    if (grade) obj.grade = grade;
    if (percent) obj.percent = percent;

    try {
      await MasterGrade.update(obj, { where: { id: _id } }),
        res.status(201).json({ msg: "Grade update Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  deleteMasterGrade: async (req, res) => {
    const _id = req.params.id;
    try {
      await MasterGrade.destroy({ where: { id: _id } }),
        res.status(201).json({ msg: "Grade delete Successfuly" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = MasterGradeController;
