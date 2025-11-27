const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const IoMounting = require("./ioMountingModel");

const { DataTypes } = Sequelize;

const IoMountingLainLain = db.define(
  "io_mounting_lain_lain",
  {
    id_io_mounting: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: IoMounting,
        key: "id",
      },
    },
    nama_item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    qty: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  }
);

IoMounting.hasMany(IoMountingLainLain, {
  foreignKey: "id_io_mounting",
  as: "lain_lain",
});
IoMountingLainLain.belongsTo(IoMounting, {
  foreignKey: "id_io_mounting",
  as: "io_mounting_lain_lain",
});

module.exports = IoMountingLainLain;
