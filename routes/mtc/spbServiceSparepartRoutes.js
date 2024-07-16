const router = require("express").Router();
const {
  getSpbServiceSparepart,
  getHistorySpbServiceSparepart,
  getHistoryRejectedSpbServiceSparepart,
  getSpbServiceSparepartById,
  getSpbServiceSparepartPurchase,
  createSpbServiceSparepart,
  createManySpbServiceSparepart,
  updateMonitoringSpbServiceSparepart,
  updateSpbServiceSparepart,
  approveSpbServiceSparepart,
  tolakSpbStokSparepart,
  doneSpbServiceSparepartPurchase,
  verifikasiSpbServiceSparepartQc,
  rejectSpbServiceSparepartQc,
} = require("../../controller/mtc/spbServiceSparepart");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/spbServiceSparepart", getSpbServiceSparepart);
router.get(
  "/spbServiceSparepart/historyRejected",
  getHistoryRejectedSpbServiceSparepart
);
router.get("/spbServiceSparepart/history", getHistorySpbServiceSparepart);
router.get("/spbServiceSparepart/:id", getSpbServiceSparepartById);
router.get("/spbServiceSparepartPurchase", getSpbServiceSparepartPurchase);
router.post("/spbServiceSparepart", auth, createSpbServiceSparepart);
router.post("/spbServiceSparepartMany", auth, createManySpbServiceSparepart);
router.put("/spbServiceSparepart/:id", updateSpbServiceSparepart);
router.put(
  "/spbServiceSparepartMonitoring/:id",
  updateMonitoringSpbServiceSparepart
);
router.put("/approveSpbService/:id", auth, approveSpbServiceSparepart);
router.put("/tolakSpbService/:id", tolakSpbStokSparepart);
router.put(
  "/doneSpbServicePurchase/:id",
  doneSpbServiceSparepartPurchase
);
router.put("/verifikasiSpbServiceqQc/:id", verifikasiSpbServiceSparepartQc);
router.put("/rejectSpbServiceqQc/:id", rejectSpbServiceSparepartQc);
// router.delete("/spbStokSparepart/:id", deletespbStokSparepart);
// router.put("/approvespbStokSparepart/:id", approveRequestspbStokSparepart);
// router.delete("/tolakspbStokSparepart/:id", tolakRequestspbStokSparepart);
// router.post("/addspbStokSparepart/:id", addStokSparepart);

module.exports = router;
