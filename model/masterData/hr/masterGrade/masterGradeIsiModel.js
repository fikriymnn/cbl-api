const { Sequelize } = require("sequelize");
const db = require("../../../../config/database");
const MasterGrade = require("./masterGradeModel");
const MasterGradeColumn = require("./masterGradeColumnModel");

const { DataTypes } = Sequelize;

const MasterGradeIsi = db.define(
  "ms_hr_grade_isi",
  {
    id_grade: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterGrade,
        key: "id",
      },
    },
    id_grade_column: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MasterGradeColumn,
        key: "id",
      },
    },
    bayaran: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

//relasi master grade
MasterGrade.hasMany(MasterGradeIsi, {
  foreignKey: "id_grade",
  as: "isi_grade",
});
MasterGradeIsi.belongsTo(MasterGrade, {
  foreignKey: "id_grade",
  as: "grade",
});
//relasi master grade column
MasterGradeColumn.hasMany(MasterGradeIsi, {
  foreignKey: "id_grade_column",
  as: "column_grade",
});
MasterGradeIsi.belongsTo(MasterGradeColumn, {
  foreignKey: "id_grade_column",
  as: "grade_column",
});

module.exports = MasterGradeIsi;
