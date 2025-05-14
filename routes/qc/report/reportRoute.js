const router = require("express").Router();
const ReportQc = require("../../../controller/qc/report/reportController");

router.get("/qc/report/checkSheet", ReportQc.getReportCheckseet);

module.exports = router;
