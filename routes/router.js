const router = require("express").Router();

router.use("/", require(".//notificationRoutes"));
router.use("/", require("./authRoutes"));
router.use("/", require("./userRoutes"));
router.use("/", require("./ticketRoutes"));
router.use("/", require("./ticketOs3Routes"));

//dashboard mtc
router.use("/", require("./mtc/DashboardMtc"));

//pm
router.use("/", require("./mtc/preventive/inspectionPm1Routes"));
router.use("/", require("./mtc/preventive/inspentionPm2Routes"));
router.use("/", require("./mtc/preventive/inspentionPm3Routes"));

//master data
router.use("/", require("./masterdata/mtc/masterMesinRoute"));
router.use("/", require("./masterdata/mtc/masterSparepartRoute"));
router.use("/", require("./masterdata/mtc/masterTimeMonitoringRoute"));
router.use("/", require("./masterdata/mtc/masterKodeAnalisisRoute"));
router.use("/", require("./masterdata/mtc/masterSkorPerbaikanRoute"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm1Route"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm2Route"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm3Route"));
router.use("/", require("./masterdata/mtc/kpi/masterKPIRoute"));

router.use("/", require("./mtc/spbStokSparepart"));
router.use("/", require("./mtc/spbServiceSparepartRoutes"));
router.use("/", require("./mtc/stokSparepartRoutes"));
router.use("/", require("./mtc/problemSparepartRoutes"));
router.use("/", require("./mtc/prosessMtcRoutes"));
router.use("/", require("./mtc/prosesMtcOs3Routes"));
router.use("/", require("./mtc/kpi/kpiActualRoute"));

//qc
router.use("/", require("./qc/inspeksi/bahan/inspeksiBahanRoutes"));
router.use("/", require("./qc/inspeksi/bahan/inspeksiBahanResultRoutes"));
router.use("/", require("./qc/inspeksi/potong/inspeksiPotongRoutes"));
router.use("/", require("./qc/inspeksi/potong/inspeksiPotongResultRoutes"));

// qc cetak
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakRoutes"));
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakAwalRoutes"));
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakAwalPointRoutes"));

router.use("/", require("./uploadRoutes"));

module.exports = router;
