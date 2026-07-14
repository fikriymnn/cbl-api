const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const JobOrder = require("../../ppic/jobOrder/jobOrderModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const TambahBahanPersiapan = db.define(
  "tambah_bahan_persiapan",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JobOrder,
        key: "id",
      },
    },
    id_kertas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    id_user_request: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_qc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_gudang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    no_jo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nama_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qty_tambah_bahan: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    qty_pakai_tambah_bahan: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_qc: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_gudang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tgl_request: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "request qc",
    },
    status_tiket: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "incoming",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    freezeTableName: true,
  },
);

JobOrder.hasMany(TambahBahanPersiapan, {
  foreignKey: "id_jo",
  as: "tambah_bahan_persiapan",
});
TambahBahanPersiapan.belongsTo(JobOrder, {
  foreignKey: "id_jo",
  as: "job_order",
});

MasterBarang.hasMany(TambahBahanPersiapan, {
  foreignKey: "id_kertas",
  as: "tambah_bahan_persiapan",
});
TambahBahanPersiapan.belongsTo(MasterBarang, {
  foreignKey: "id_kertas",
  as: "detail_kertas",
});

Users.hasMany(TambahBahanPersiapan, {
  foreignKey: "id_user_request",
  as: "tambah_bahan_persiapan_request",
});
TambahBahanPersiapan.belongsTo(Users, {
  foreignKey: "id_user_request",
  as: "user_request",
});

Users.hasMany(TambahBahanPersiapan, {
  foreignKey: "id_user_qc",
  as: "tambah_bahan_persiapan_qc",
});
TambahBahanPersiapan.belongsTo(Users, {
  foreignKey: "id_user_qc",
  as: "user_qc",
});

Users.hasMany(TambahBahanPersiapan, {
  foreignKey: "id_user_gudang",
  as: "tambah_bahan_persiapan_gudang",
});
TambahBahanPersiapan.belongsTo(Users, {
  foreignKey: "id_user_gudang",
  as: "user_gudang",
});

module.exports = TambahBahanPersiapan;
