const router = require("express").Router();
const MasterVendorController = require("../../../controller/masterData/marketing/masterVendorController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/marketing/vendor/list/:id?",
  auth,
  MasterVendorController.getMasterVendor
);
router.post(
  "/master/marketing/vendor/list",
  auth,
  MasterVendorController.createMasterVendor
);
router.put(
  "/master/marketing/vendor/list/:id",
  auth,
  MasterVendorController.updateMasterVendor
);
router.delete(
  "/master/marketing/vendor/list/:id",
  auth,
  MasterVendorController.deleteMasterVendor
);

module.exports = router;
