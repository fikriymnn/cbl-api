const router = require("express").Router();
const {
  getSpbServiceSparepart,
  getHistorySpbServiceSparepart,
  getHistoryRejectedSpbServiceSparepart,
  getSpbServiceSparepartById,
  createSpbServiceSparepart,
  createManySpbServiceSparepart,
  updateMonitoringSpbServiceSparepart,
  updateSpbServiceSparepart,
  approveSpbServiceSparepart,
  tolakSpbStokSparepart,
  doneSpbServiceSparepartPurchase,
} = require("../../controller/mtc/spbServiceSparepart");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/spbServiceSparepart", getSpbServiceSparepart);
router.get(
  "/spbServiceSparepart/historyRejected",
  getHistoryRejectedSpbServiceSparepart
);
router.get("/spbServiceSparepart/history", getHistorySpbServiceSparepart);
router.get("/spbServiceSparepart/:id", getSpbServiceSparepartById);
router.post("/spbServiceSparepart", auth, createSpbServiceSparepart);
router.post("/spbServiceSparepartMany", auth, createManySpbServiceSparepart);
router.put("/spbServiceSparepart/:id", updateSpbServiceSparepart);
router.put(
  "/spbServiceSparepartMonitoring/:id",
  updateMonitoringSpbServiceSparepart
);
router.put("/approveSpbService/:id", approveSpbServiceSparepart);
router.put("/tolakSpbService/:id", tolakSpbStokSparepart);
router.put("/doneSpbServicePurchase/:id", doneSpbServiceSparepartPurchase);
// router.delete("/spbStokSparepart/:id", deletespbStokSparepart);
// router.put("/approvespbStokSparepart/:id", approveRequestspbStokSparepart);
// router.delete("/tolakspbStokSparepart/:id", tolakRequestspbStokSparepart);
// router.post("/addspbStokSparepart/:id", addStokSparepart);

module.exports = router;
