const { where } = require("sequelize");
const Ticket = require("../../model/maintenaceTicketModel");
const Users = require("../../model/userModel");
const KendalaLkh = require("../../model/kendalaLkh/kendalaLkhModel");
const KendalaLkhDepartment = require("../../model/kendalaLkh/kendalaLkhDepartmentModel");

const ValidasiController = {
  getTicketValidasi: async (req, res) => {
    try {
      const dataGabungan = [];
      const response = await Ticket.findAll({
        where: { bagian_tiket: "qc" },
      });
      const responseKendalaLkh = await KendalaLkh.findAll({
        where: { status_tiket: "incoming" },
        include: [
          {
            model: KendalaLkhDepartment,
            as: "data_department",
          },
          {
            model: Users,
            as: "user_qc",
          },
        ],
      });

      //masukan data tiket mtc ke array
      dataGabungan.push(...response);
      //masukan data tiket kendala ke array
      dataGabungan.push(...responseKendalaLkh);
      // Sorting berdasarkan tanggal (terbaru ke terlama)
      dataGabungan.sort((a, b) => b.createdAt - a.createdAt);

      res.status(200).json({
        data: dataGabungan,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

module.exports = ValidasiController;
