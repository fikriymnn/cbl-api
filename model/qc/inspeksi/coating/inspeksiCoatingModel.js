const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiCoating = db.define(
  "cs_inspeksi_coating",
  {
    tanggal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
    coating: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jenis_kertas: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    jenis_gramatur: {
        type: DataTypes.STRING,
        allowNull: false,
    },
      jam: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nama_produk: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shift: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status_jo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    status: {
      type: DataTypes.STRING,
      defaultValue: "incoming",
    }
  },
  {
    freezeTableName: true,
  }
);

module.exports = InspeksiCoating;