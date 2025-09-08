const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Io = require("../io/ioModel");
const IoMounting = require("../io/ioMountingModel");
const MasterTahapanMesin = require("../../masterData/tahapan/masterTahapanMesinModel");
const MasterSettingKapasitas = require("../../masterData/ppic/masterKategoriSettingKapasitasModel");
const MasterDryingTime = require("../../masterData/ppic/masterDryingTimeModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const ioTahapan = db.define(
  "io_tahapan",
  {
    id_io: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Io,
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
    id_tahapan_mesin: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterTahapanMesin,
        key: "id",
      },
    },
    id_setting_kapasitas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterSettingKapasitas,
        key: "id",
      },
    },
    id_drying_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: MasterDryingTime,
        key: "id",
      },
    },
    nama_proses: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: true,
    },
    nama_mesin: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: true,
    },
    nama_setting_kapasitas: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: true,
    },
    value_setting_kapasitas: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: true,
    },
    nama_drying_time: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: true,
    },
    value_drying_time: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: true,
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: true,
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

Io.hasMany(ioTahapan, {
  foreignKey: "id_io",
  as: "io_tahapan",
});
ioTahapan.belongsTo(Io, {
  foreignKey: "id_io",
  as: "io",
});

IoMounting.hasMany(ioTahapan, {
  foreignKey: "id_io_mounting",
  as: "tahapan",
});
ioTahapan.belongsTo(IoMounting, {
  foreignKey: "id_io_mounting",
  as: "mounting",
});

MasterTahapanMesin.hasMany(ioTahapan, {
  foreignKey: "id_tahapan_mesin",
});
ioTahapan.belongsTo(MasterTahapanMesin, {
  foreignKey: "id_tahapan_mesin",
  as: "tahapan_mesin",
});

MasterSettingKapasitas.hasMany(ioTahapan, {
  foreignKey: "id_setting_kapasitas",
});
ioTahapan.belongsTo(MasterSettingKapasitas, {
  foreignKey: "id_setting_kapasitas",
  as: "setting_kapasitas",
});

MasterDryingTime.hasMany(ioTahapan, {
  foreignKey: "id_drying_time",
});
ioTahapan.belongsTo(MasterDryingTime, {
  foreignKey: "id_drying_time",
  as: "drying_time",
});

module.exports = ioTahapan;
