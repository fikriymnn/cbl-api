const { Sequelize } = require("sequelize");
const db = require("../../config/database");
const Users = require("../userModel")
const Ticket = require("../maintenaceTicketModel")


const { DataTypes } = Sequelize;

const UsersActionMtc = db.define(
  "user_action_mtc",
  {
   
    id_mtc: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: Users,
        key: "id"
    }
    },
    id_tiket: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references:{
            model: Ticket,
            key: "id"
        },
      },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
     
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
  },
  {
    freezeTableName: true,
  }
);


UsersActionMtc.hasMany(Ticket,{foreignKey : "id_tiket"})
Users.hasMany(UsersActionMtc, {foreignKey : "id_mtc", })

UsersActionMtc.belongsTo(Users,{foreignKey : "id_mtc",as:"user_mtc"})
Ticket.hasMany(UsersActionMtc, {foreignKey : "id_tiket", as:"user_ticket"})



module.exports = UsersActionMtc;