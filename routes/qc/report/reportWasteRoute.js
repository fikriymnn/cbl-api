const router = require("express").Router();
const ReportWasterController = require("../../../controller/qc/report/reportWasteController");

router.post("/reportWaste", ReportWasterController.getReportWasteQc);
router.post("/reportWasteByJo", ReportWasterController.getReportWasteByJo);

module.exports = router;
