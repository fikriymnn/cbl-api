const { Sequelize } = require("sequelize");
const { DataTypes } = Sequelize;
const db = require("../../../../config/database");

const InspeksiCoating = db.define(
  "cs_inspeksi_coating",
  {
    id_coating_result_awal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_coating_sub_awal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_coating_result_periode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_coating_sub_periode: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tanggal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jumlah: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
    jenis_kertas: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    jenis_gramatur: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    warna_depan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      warna_belakang: {
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
    inspector: {
      type: DataTypes.STRING,
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