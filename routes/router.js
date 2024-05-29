const router = require("express").Router();

router.use("/", require("./authRoutes"));
router.use("/", require("./userRoutes"));
router.use("/", require("./ticketRoutes"));
router.use("/", require("./ticketOs3Routes"));

router.use("/", require("./mtc/pm1/inspectionPm1Routes"));

//master data
router.use("/", require("./masterdata/mtc/masterMesinRoute"));
router.use("/", require("./masterdata/mtc/masterSparepartRoute"));
router.use("/", require("./masterdata/mtc/masterTimeMonitoringRoute"));
router.use("/", require("./masterdata/mtc/masterKodeAnalisisRoute"));
router.use("/", require("./masterdata/mtc/masterSkorPerbaikanRoute"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm1Route"));

router.use("/", require("./mtc/stokSparepartRoutes"));
router.use("/", require("./mtc/problemSparepartRoutes"));
router.use("/", require("./mtc/prosessMtcRoutes"));
router.use("/", require("./mtc/prosesMtcOs3Routes"));

router.use("/", require("./uploadRoutes"));

module.exports = router;
