const router = require("express").Router();
const MasterHargaPengirimanController = require("../../../controller/masterData/marketing/masterHargaPengirimanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/marketing/pengiriman/:id?",
  auth,
  MasterHargaPengirimanController.getMasterHargaPengiriman
);
router.post(
  "/master/marketing/pengiriman",
  auth,
  MasterHargaPengirimanController.createMasterHargaPengiriman
);
router.put(
  "/master/marketing/pengiriman/:id",
  auth,
  MasterHargaPengirimanController.updateMasterHargaPengiriman
);
router.delete(
  "/master/marketing/pengiriman/:id",
  auth,
  MasterHargaPengirimanController.deleteMasterHargaPengiriman
);

module.exports = router;
