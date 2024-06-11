const router = require("express").Router();
const {
  getSpbServiceSparepart,
  getSpbServiceSparepartById,
  createSpbServiceSparepart,
  createManySpbServiceSparepart,
  updateMonitoringSpbServiceSparepart,
  updateSpbServiceSparepart,
  approveSpbServiceSparepart,
  tolakSpbStokSparepart,
} = require("../../controller/mtc/spbServiceSparepart");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/spbServiceSparepart", getSpbServiceSparepart);
router.get("/spbServiceSparepart/:id", getSpbServiceSparepartById);
router.post("/spbServiceSparepart", createSpbServiceSparepart);
router.post("/spbServiceSparepartMany", createManySpbServiceSparepart);
router.put("/spbServiceSparepart/:id", updateSpbServiceSparepart);
router.put(
  "/spbServiceSparepartMonitoring/:id",
  updateMonitoringSpbServiceSparepart
);
router.put("/approveSpbService/:id", approveSpbServiceSparepart);
router.put("/tolakSpbService/:id", tolakSpbStokSparepart);
// router.delete("/spbStokSparepart/:id", deletespbStokSparepart);
// router.put("/approvespbStokSparepart/:id", approveRequestspbStokSparepart);
// router.delete("/tolakspbStokSparepart/:id", tolakRequestspbStokSparepart);
// router.post("/addspbStokSparepart/:id", addStokSparepart);

module.exports = router;
