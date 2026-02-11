const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const MasterTahapan = require("../tahapan/masterTahapanModel");
const MasterKriteriaKendala = require("./masterKriteriaKendalaModel");
const MasterKategoriKendala = require("./masterKategoriKendalaModel");
const { DataTypes } = Sequelize;

const MasterKodeProduksi = db.define(
  "ms_kode_produksi",
  {
    id_tahapan_produksi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterTahapan,
        key: "id",
      },
    },
    proses_produksi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_kriteria_qty_produksi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },
    id_kriteria_qty_qc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },
    id_kriteria_qty_mtc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },
    id_kriteria_waktu_produksi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },
    id_kriteria_waktu_qc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },
    id_kriteria_waktu_mtc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },

    id_kriteria_frekuensi_produksi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },
    id_kriteria_frekuensi_qc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },
    id_kriteria_frekuensi_mtc: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKriteriaKendala,
        key: "id",
      },
    },
    id_kategori_kendala: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterKategoriKendala,
        key: "id",
      },
    },

    target_department: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    freezeTableName: true,
  },
);

MasterTahapan.hasMany(MasterKodeProduksi, {
  foreignKey: "id_tahapan_produksi",
});
MasterKodeProduksi.belongsTo(MasterTahapan, {
  foreignKey: "id_tahapan_produksi",
  as: "tahapan",
});

// kriteria qty produksi
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_qty_produksi",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_qty_produksi",
  as: "kriteria_qty_produksi",
});

// kriteria qty qc
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_qty_qc",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_qty_qc",
  as: "kriteria_qty_qc",
});

// kriteria qty mtc
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_qty_mtc",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_qty_mtc",
  as: "kriteria_qty_mtc",
});

// kriteria waktu produksi
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_waktu_produksi",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_waktu_produksi",
  as: "kriteria_waktu_produksi",
});

// kriteria waktu qc
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_waktu_qc",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_waktu_qc",
  as: "kriteria_waktu_qc",
});

// kriteria waktu mtc
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_waktu_mtc",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_waktu_mtc",
  as: "kriteria_waktu_mtc",
});

// kriteria frekuensi produksi
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_frekuensi_produksi",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_frekuensi_produksi",
  as: "kriteria_frekuensi_produksi",
});

// kriteria frekuensi qc
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_frekuensi_qc",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_frekuensi_qc",
  as: "kriteria_frekuensi_qc",
});

// kriteria frekuensi mtc
MasterKriteriaKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kriteria_frekuensi_mtc",
});
MasterKodeProduksi.belongsTo(MasterKriteriaKendala, {
  foreignKey: "id_kriteria_frekuensi_mtc",
  as: "kriteria_frekuensi_mtc",
});

// kategori kendala
MasterKategoriKendala.hasMany(MasterKodeProduksi, {
  foreignKey: "id_kategori_kendala",
});
MasterKodeProduksi.belongsTo(MasterKategoriKendala, {
  foreignKey: "id_kategori_kendala",
  as: "kategori_kendala",
});

module.exports = MasterKodeProduksi;
