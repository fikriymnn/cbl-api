const { Sequelize } = require("sequelize");
const db = require("../../../config/database");
const Okp = require("./okpModel");
const Users = require("../../userModel");

const { DataTypes } = Sequelize;

const okpProses = db.define(
  "okp_proses",
  {
    id_okp: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Okp,
        key: "id",
      },
    },
    id_user_desain: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_qa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_terima_marketing: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_acc_customer: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    id_user_reject: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Users,
        key: "id",
      },
    },
    tgl_okp_desain: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    tgl_terima_qa: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_terima_marketing: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_acc_customer: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tgl_reject: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    note_okp_desain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_terima_qa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_terima_marketing: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_acc_customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bagian_reject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    note_reject: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "active",
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

Okp.hasMany(okpProses, {
  foreignKey: "id_okp",
  as: "okp_proses",
});
okpProses.belongsTo(Okp, {
  foreignKey: "id_okp",
  as: "okp",
});

Users.hasMany(okpProses, {
  foreignKey: "id_user_desain",
});
okpProses.belongsTo(Users, {
  foreignKey: "id_user_desain",
  as: "user_desain",
});

Users.hasMany(okpProses, {
  foreignKey: "id_user_qa",
});
okpProses.belongsTo(Users, {
  foreignKey: "id_user_qa",
  as: "user_qa",
});

Users.hasMany(okpProses, {
  foreignKey: "id_user_terima_marketing",
});
okpProses.belongsTo(Users, {
  foreignKey: "id_user_terima_marketing",
  as: "user_terima_marketing",
});

Users.hasMany(okpProses, {
  foreignKey: "id_user_acc_customer",
});
okpProses.belongsTo(Users, {
  foreignKey: "id_user_acc_customer",
  as: "user_acc_customer",
});

Users.hasMany(okpProses, {
  foreignKey: "id_user_reject",
});
okpProses.belongsTo(Users, {
  foreignKey: "id_user_reject",
  as: "user_reject",
});

module.exports = okpProses;
