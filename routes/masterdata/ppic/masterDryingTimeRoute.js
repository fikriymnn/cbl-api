const router = require("express").Router();
const masterDryingTimeController = require("../../../controller/masterData/ppic/masterDryingTimeController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/ppic/dryingTime/:id?",
  masterDryingTimeController.getMasterDryingTime
);
router.post(
  "/master/ppic/dryingTime",
  auth,
  masterDryingTimeController.createMasterDryingTime
);
router.put(
  "/master/ppic/dryingTime/:id",
  auth,
  masterDryingTimeController.updateMasterDryingTime
);
router.delete(
  "/master/ppic/dryingTime/:id",
  auth,
  masterDryingTimeController.deleteMasterDryingTime
);

module.exports = router;
