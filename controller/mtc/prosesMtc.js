const { Op } = require("sequelize");
const Ticket = require("../../model/maintenaceTicketModel");
const Users = require("../../model/userModel");
const userActionMtc = require("../../model/mtc/userActionMtc");

const MasalahSparepart = require("../../model/mtc/sparepartProblem");
const StokSparepart = require("../../model/mtc/stokSparepart");
const MasterSparepart = require("../../model/masterData/masterSparepart");
const ProsesMtc = require("../../model/mtc/prosesMtc");

const ProsessMtc = {
  getProsesMtcById: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await ProsesMtc.findOne({
        where: {
          id: _id,
        },
        include: [
          {
            model: Users,
            as: "user_eksekutor",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
          {
            model: Users,
            as: "user_qc",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
          {
            model: Ticket,
            as: "tiket",
          },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getProsesMtcByTicket: async (req, res) => {
    const _id = req.params.id;
    try {
      const response = await ProsesMtc.findAll({
        where: {
          id_tiket: _id,
        },
        include: [
          {
            model: Users,
            as: "user_eksekutor",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
          {
            model: Users,
            as: "user_qc",
            attributes: ["id", "uuid", "nama", "email", "role", "no", "status"],
          },
          //   {
          //     model: Ticket,
          //     as: "tiket",
          //   },
        ],
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = ProsessMtc;
