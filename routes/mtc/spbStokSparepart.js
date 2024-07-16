const router = require("express").Router();
const {
  getSpbStokSparepart,
  getSpbStokSparepartPurchase,
  getHistoryRejectedSpbStokSparepart,
  getHistorySpbStokSparepart,
  getSpbStokSparepartById,
  createSpbStokSparepart,
  createManySpbStokSparepart,
  updateSpbStokSparepart,
  updateMonitoringSpbStokSparepart,
  approveSpbStokSparepart,
  tolakSpbStokSparepart,
  doneSpbStokSparepartPurchase,
} = require("../../controller/mtc/spbStokSparepart");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/spbStokSparepart", getSpbStokSparepart);
router.get(
  "/spbStokSparepart/historyRejected",
  getHistoryRejectedSpbStokSparepart
);
router.get("/spbStokSparepartPurchase", getSpbStokSparepartPurchase);
router.get("/spbStokSparepart/history", getHistorySpbStokSparepart);
router.get("/spbStokSparepart/:id", getSpbStokSparepartById);
router.post("/spbStokSparepart", auth, createSpbStokSparepart);
router.post("/spbStokSparepartMany", auth, createManySpbStokSparepart);
router.put("/spbStokSparepart/:id", updateSpbStokSparepart);
router.put("/spbStokSparepartMonitoring/:id", updateMonitoringSpbStokSparepart);
router.put("/approveSpbStok/:id", approveSpbStokSparepart);
router.put("/tolakSpbStok/:id", tolakSpbStokSparepart);
router.put("/doneSpbStokPurchase/:id", doneSpbStokSparepartPurchase);
// router.delete("/spbStokSparepart/:id", deletespbStokSparepart);
// router.put("/approvespbStokSparepart/:id", approveRequestspbStokSparepart);
// router.delete("/tolakspbStokSparepart/:id", tolakRequestspbStokSparepart);
// router.post("/addspbStokSparepart/:id", addStokSparepart);

module.exports = router;
