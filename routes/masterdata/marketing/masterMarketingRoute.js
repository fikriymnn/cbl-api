const router = require("express").Router();
const MasterMarketingController = require("../../../controller/masterData/marketing/masterMarketingController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/marketing/:id?",
  auth,
  MasterMarketingController.getMasterMarketing
);
router.post(
  "/master/marketing",
  auth,
  MasterMarketingController.createMasterMarketing
);
router.put(
  "/master/marketing/:id",
  auth,
  MasterMarketingController.updateMasterMarketing
);
router.delete(
  "/master/marketing/:id",
  auth,
  MasterMarketingController.deleteMasterMarketing
);

module.exports = router;
