const router = require("express").Router();

const reportKapasitasController = require("../../../controller/ppic/report/reportKapasitasController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/ppic/reportKapasitas",
  reportKapasitasController.getReportKapasitas
);

module.exports = router;
