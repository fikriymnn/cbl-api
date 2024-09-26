const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");
const IncomingOutsourcing = require("./incomingOutsourcingModel");

const IncomingOutsourcingResult = db.define(
  "cs_incoming_outsourcing_result",
  {
    id_incoming_outsourcing: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: IncomingOutsourcing,
        key: "id",
      },
    },
    no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    point_check: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    standard: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hasil_check: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    send: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);

IncomingOutsourcing.hasMany(IncomingOutsourcingResult, {
  foreignKey: "id_incoming_outsourcing",
  as: "incoming_outsourcing_result",
});
IncomingOutsourcingResult.belongsTo(IncomingOutsourcing, {
  foreignKey: "id_incoming_outsourcing",
  as: "incoming_outsourcing_point",
});

module.exports = IncomingOutsourcingResult;
