const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const JobOrder = require("./jobOrderModel");
const IoMounting = require("../../marketing/io/ioMountingModel");
const MasterBarang = require("../../masterData/barang/masterBarangModel");

const { DataTypes } = Sequelize;

const JobOrderMounting = db.define(
  "jo_mounting_new",
  {
    id_jo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: JobOrder,
        key: "id",
      },
    },
    id_io_mounting: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: IoMounting,
        key: "id",
      },
    },
    nama_mounting: {
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
    panjang_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    lebar_kertas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_kertas: {
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
    jumlah_cetak_1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    tambahan_insheet_1: {
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
    jumlah_cetak_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    tambahan_insheet_2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },

    jumlah_druk_cetak: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_insheet_cetak: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_druk_pond: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_insheet_pond: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_druk_finishing: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    jumlah_insheet_finishing: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    total_insheet: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    is_selected: {
      type: DataTypes.BOOLEAN,
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

JobOrder.hasMany(JobOrderMounting, {
  foreignKey: "id_jo",
  as: "jo_mounting",
});
JobOrderMounting.belongsTo(JobOrder, {
  foreignKey: "id_jo",
  as: "jo",
});

MasterBarang.hasMany(JobOrderMounting, {
  foreignKey: "id_kertas",
  as: "jo_mounting",
});
JobOrderMounting.belongsTo(MasterBarang, {
  foreignKey: "id_kertas",
  as: "kertas",
});

IoMounting.hasMany(JobOrderMounting, {
  foreignKey: "id_io_mounting",
  as: "jo_mounting",
});
JobOrderMounting.belongsTo(IoMounting, {
  foreignKey: "id_io_mounting",
  as: "io_mounting",
});

module.exports = JobOrderMounting;
