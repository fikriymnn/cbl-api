const router = require("express").Router();
const absenController = require("../../controller/hr/absenCheckInOutController");

router.get("/hr/absensiInOut", absenController.getAbsensiCheckinOut);
router.post("/hr/absensiInOut", absenController.createAbsensiCheckinOut);
router.put("/hr/absensiInOut", absenController.updateAbsensiCheckinOut);
router.delete("/hr/absensiInOut", absenController.deleteAbsensiCheckinOut);

module.exports = router;
