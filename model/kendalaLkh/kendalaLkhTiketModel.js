const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Users = require("../userModel");

const { DataTypes } = Sequelize;

const KendalaLkhTiket = db.define(
  "kendala_lkh_tiket",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_kendala: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_inspektor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_inspektor_p1: {
      type: DataTypes.INTEGER,
      allowNull: true,
      //   references: {
      //     model: Users,
      //     key: "id",
      //   },
    },
    nama_inspektor: {
      type: DataTypes.STRING,
      allowNull: true,
      //   references: {
      //     model: Users,
      //     key: "id",
      //   },
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_produk: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_io: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_so: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mesin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operator: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_kendala: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_lkh: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status_tiket: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "incoming",
    },
    note_qc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    analisa_penyebab: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tindakan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_department: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    maksimal_waktu_pengerjaan: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    stop: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  {
    freezeTableName: true,
  }
);

Users.hasMany(KendalaLkhTiket, { foreignKey: "id_inspektor" });

KendalaLkhTiket.belongsTo(Users, {
  foreignKey: "id_inspektor",
  as: "user_inspektor",
});

module.exports = KendalaLkhTiket;
