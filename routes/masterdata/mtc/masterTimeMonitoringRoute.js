const router = require("express").Router();
const {
  getMasterTimeMonitoring,
  getMasterTimeMonitoringById,
  createMasterTimeMonitoring,
  updateMasterTimeMonitoring,
  deleteMasterTimeMonitoring,
} = require("../../../controller/masterData/mtc/timeMonitoringController");
const { Auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/waktuMonitoring", getMasterTimeMonitoring);
router.get("/master/waktuMonitoring/:id", getMasterTimeMonitoringById);
router.post("/master/waktuMonitoring", Auth, createMasterTimeMonitoring);
router.put("/master/waktuMonitoring/:id", Auth, updateMasterTimeMonitoring);
router.delete("/master/waktuMonitoring/:id", Auth, deleteMasterTimeMonitoring);

module.exports = router;
