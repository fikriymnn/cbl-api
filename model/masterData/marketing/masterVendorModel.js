const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const { DataTypes } = Sequelize;

const MasterVendor = db.define(
  "ms_vendor",
  {
    nama_vendor: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telepon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tipe_vendor: {
      type: DataTypes.JSON, // <-- array disimpan sebagai JSON
      allowNull: true,
      defaultValue: [],
      get() {
        const raw = this.getDataValue("tipe_vendor");

        if (!raw) return [];

        if (typeof raw === "string") {
          try {
            return JSON.parse(raw);
          } catch {
            return [];
          }
        }

        return raw;
      },
      set(value) {
        // pastikan selalu array sebelum disimpan
        if (!Array.isArray(value)) {
          throw new Error("tipe_vendor harus berupa array");
        }
        this.setDataValue("tipe_vendor", value);
      },
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

module.exports = MasterVendor;
