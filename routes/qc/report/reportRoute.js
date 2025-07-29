const router = require("express").Router();
const ReportQc = require("../../../controller/qc/report/reportController");
const ReportTemuan = require("../../../controller/qc/report/reportTemuanController");

router.get("/qc/report/checkSheet", ReportQc.getReportCheckseet);
router.get(
  "/qc/report/checkSheet/temuan",
  ReportTemuan.getReportCheckseetTemuan
);

module.exports = router;
