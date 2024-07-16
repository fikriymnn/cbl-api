const { Op, Sequelize } = require("sequelize");
const TicketOs2 = require("../../model/maintenaceTicketModel");
const TicketOs3 = require("../../model/maintenanceTicketOs3Model");
const DashboardMaintenance = {
  getDataPerbandinganOs2Os3: async (req, res) => {
    try {
      const Os2 = await TicketOs2.findAll({
        attributes: ["status_tiket", [Sequelize.fn("COUNT", "*"), "count"]],
        group: ["status_tiket"],
        where: {
          status_tiket: {
            [Op.ne]: "done",
          },
        },
      });

      const Os3 = await TicketOs3.findAll({
        attributes: ["status_tiket", [Sequelize.fn("COUNT", "*"), "count"]],
        group: ["status_tiket"],
        where: {
          status_tiket: {
            [Op.ne]: "done",
          },
        },
      });

      res.status(200).json({ os2: Os2, os3: Os3 });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },

  getDataDetailMesinProblem: async (req, res) => {
    try {
      const DefectOs2 = await TicketOs2.findAll({
        attributes: ["mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        group: ["mesin"],
        order: [[Sequelize.col("count"), "DESC"]],
      });

      const DefectOs3 = await TicketOs3.findAll({
        attributes: ["nama_mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        group: ["nama_mesin"],
        order: [[Sequelize.col("count"), "DESC"]],
      });

      const qualityProblemMesinOs2 = await TicketOs2.findAll({
        attributes: ["mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        group: ["mesin"],
        where: {
          jenis_analisis_mtc: "quality",
        },
        order: [[Sequelize.col("count"), "DESC"]],
      });

      const productionProblemMesinOs2 = await TicketOs2.findAll({
        attributes: ["mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        group: ["mesin"],
        where: {
          jenis_analisis_mtc: "produksi",
        },
        order: [[Sequelize.col("count"), "DESC"]],
      });

      const qualityProblemMesinOs3 = await TicketOs3.findAll({
        attributes: ["nama_mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        group: ["nama_mesin"],
        where: {
          jenis_analisis_mtc: "quality",
        },
        order: [[Sequelize.col("count"), "DESC"]],
      });

      const productionProblemMesinOs3 = await TicketOs3.findAll({
        attributes: ["nama_mesin", [Sequelize.fn("COUNT", "*"), "count"]],
        group: ["nama_mesin"],
        where: {
          jenis_analisis_mtc: "produksi",
        },
        order: [[Sequelize.col("count"), "DESC"]],
      });

      res.status(200).json({
        defectOs2: DefectOs2,
        defectOs3: DefectOs3,
        qcProblemOs2: qualityProblemMesinOs2,
        prodProblemMesinOs2: productionProblemMesinOs2,
        qcProblemOs3: qualityProblemMesinOs3,
        prodProblemMesinOs3: productionProblemMesinOs3,
      });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
};

module.exports = DashboardMaintenance;
