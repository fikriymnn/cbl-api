const router = require("express").Router();
const ReportQc = require("../../../controller/qc/report/reportController");
const ReportInspektorQc = require("../../../controller/qc/report/reportInspektorController");
const ReportTemuan = require("../../../controller/qc/report/reportTemuanController");

router.get("/qc/report/checkSheet", ReportQc.getReportCheckseet);
router.get(
  "/qc/report/checkSheet/inspektor",
  ReportInspektorQc.getReportByInspektor,
);
router.get(
  "/qc/report/checkSheet/temuan",
  ReportTemuan.getReportCheckseetTemuan,
);

module.exports = router;
