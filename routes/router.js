const router = require("express").Router();

router.use("/", require(".//notificationRoutes"));
router.use("/", require("./authRoutes"));
router.use("/", require("./userRoutes"));
router.use("/", require("./ticketRoutes"));
router.use("/", require("./ticketOs3Routes"));

//pm
router.use("/", require("./mtc/preventive/inspectionPm1Routes"));
router.use("/", require("./mtc/preventive/inspentionPm2Routes"));

//master data
router.use("/", require("./masterdata/mtc/masterMesinRoute"));
router.use("/", require("./masterdata/mtc/masterSparepartRoute"));
router.use("/", require("./masterdata/mtc/masterTimeMonitoringRoute"));
router.use("/", require("./masterdata/mtc/masterKodeAnalisisRoute"));
router.use("/", require("./masterdata/mtc/masterSkorPerbaikanRoute"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm1Route"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm2Route"));
router.use("/", require("./masterdata/mtc/kpi/masterKPIRoute"));

router.use("/", require("./mtc/spbStokSparepart"));
router.use("/", require("./mtc/spbServiceSparepartRoutes"));
router.use("/", require("./mtc/stokSparepartRoutes"));
router.use("/", require("./mtc/problemSparepartRoutes"));
router.use("/", require("./mtc/prosessMtcRoutes"));
router.use("/", require("./mtc/prosesMtcOs3Routes"));
router.use("/", require("./mtc/kpi/kpiActualRoute"));

router.use("/", require("./uploadRoutes"));

module.exports = router;
