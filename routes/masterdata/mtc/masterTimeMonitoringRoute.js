const router = require("express").Router();
const {
  getMasterTimeMonitoring,
  getMasterTimeMonitoringById,
  createMasterTimeMonitoring,
  updateMasterTimeMonitoring,
  deleteMasterTimeMonitoring,
} = require("../../../controller/masterData/mtc/timeMonitoringController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/waktuMonitoring", getMasterTimeMonitoring);
router.get("/master/waktuMonitoring/:id", getMasterTimeMonitoringById);
router.post("/master/waktuMonitoring", auth, createMasterTimeMonitoring);
router.put("/master/waktuMonitoring/:id", auth, updateMasterTimeMonitoring);
router.delete("/master/waktuMonitoring/:id", auth, deleteMasterTimeMonitoring);

module.exports = router;
