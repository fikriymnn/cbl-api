const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const BomModel = require("./bomModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");
const MasterTahapanMesin = require("../../masterData/tahapan/masterTahapanMesinModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const BomMounting = db.define(
  "bom_mounting",
  {
    id_bom: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: BomModel,
        key: "id",
      },
    },

    nama_mounting: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    format_data: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan_revisi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ukuran_jadi_panjang: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_jadi_lebar: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_jadi_tinggi: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_jadi_terb_panjang: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_jadi_terb_lebar: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },

    warna_depan: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    warna_belakang: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_warna: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    keterangan_warna_depan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan_warna_belakang: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    id_coating_depan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_coating_depan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merk_coating_depan: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    id_coating_belakang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_coating_belakang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merk_coating_belakang: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merk_serat_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jenis_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_kertas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_kertas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gramature_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    panjang_plano: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    lebar_plano: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    panjang_layout: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    lebar_layout: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_panjang_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_lebar_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_bagian_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_isi_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_panjang_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_lebar_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_bagian_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    ukuran_cetak_isi_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    id_layout: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_jenis_pons: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_jenis_pons: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan_jenis_pons: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    id_lem: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterBarang,
        key: "id",
      },
    },
    nama_lem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    merk_komp_lem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan_lem: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isi_salam_1_pack: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    jenis_pack: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    keterangan_pack: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lampiran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_ukuran_partisi_sekat: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    panjang_partisi_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lebar_partisi_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    panjang_partisi_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    lebar_partisi_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    tambahan_insheet_druk: {
      type: DataTypes.FLOAT,
      allowNull: true,
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

BomModel.hasMany(BomMounting, {
  foreignKey: "id_bom",
  as: "bom_mounting",
});
BomMounting.belongsTo(BomModel, {
  foreignKey: "id_bom",
  as: "bom",
});

//~~start~~//
MasterBarang.hasMany(BomMounting, {
  foreignKey: "id_coating_depan",
});
BomMounting.belongsTo(MasterBarang, {
  foreignKey: "id_coating_depan",
  as: "coating_depan",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(BomMounting, {
  foreignKey: "id_coating_belakang",
});
BomMounting.belongsTo(MasterBarang, {
  foreignKey: "id_coating_belakang",
  as: "coating_belakang",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(BomMounting, {
  foreignKey: "id_jenis_pons",
});
BomMounting.belongsTo(MasterBarang, {
  foreignKey: "id_jenis_pons",
  as: "jenis_pons",
});
//~~end~~//

//~~start~~//
MasterBarang.hasMany(BomMounting, {
  foreignKey: "id_lem",
});
BomMounting.belongsTo(MasterBarang, {
  foreignKey: "id_lem",
  as: "lem",
});
//~~end~~//

module.exports = BomMounting;
