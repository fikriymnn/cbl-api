const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const { DataTypes } = Sequelize;
const Mesin = require("../../masterData/masterMesinModel");
const Users = require("../../userModel");

const inspectionTaskPm1 = db.define("inspection_task_pm1", {
  id_mesin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Mesin,
      key: "id",
    },
  },
  nama_mesin: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },
  id_inspector: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },
  id_leader: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },
  id_supervisor: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },
  id_ka_bag_mtc: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: "id",
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "open",
  },
});

Mesin.hasMany(inspectionTaskPm1, { foreignKey: "id_mesin" });
Users.hasMany(inspectionTaskPm1, { foreignKey: "id_inspector" });
Users.hasMany(inspectionTaskPm1, { foreignKey: "id_leader" });
Users.hasMany(inspectionTaskPm1, { foreignKey: "id_supervisor" });
Users.hasMany(inspectionTaskPm1, { foreignKey: "id_ka_bag_mtc" });

inspectionTaskPm1.belongsTo(inspectionTaskPm1, {
  foreignKey: "id_mesin",
  as: "mesin",
});
inspectionTaskPm1.belongsTo(inspectionTaskPm1, {
  foreignKey: "id_inspector",
  as: "inspector",
});
inspectionTaskPm1.belongsTo(inspectionTaskPm1, {
  foreignKey: "id_leader",
  as: "leader",
});
inspectionTaskPm1.belongsTo(inspectionTaskPm1, {
  foreignKey: "id_supervisor",
  as: "supervisor",
});
inspectionTaskPm1.belongsTo(inspectionTaskPm1, {
  foreignKey: "id_ka_bag_mtc",
  as: "ka_bag_mtc",
});

module.exports = inspectionTaskPm1;
