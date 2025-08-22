const router = require("express").Router();
const MasterTahapanMesinController = require("../../../controller/masterData/tahapan/masterTahapanMesinController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/tahapanMesin/:id?",
  auth,
  MasterTahapanMesinController.getMastertahapanMesin
);
router.post(
  "/master/tahapanMesin",
  auth,
  MasterTahapanMesinController.createMastertahapanMesin
);
router.put(
  "/master/tahapanMesin/:id",
  auth,
  MasterTahapanMesinController.updateMastertahapanMesin
);
router.delete(
  "/master/tahapanMesin/:id",
  auth,
  MasterTahapanMesinController.deleteMastertahapanMesin
);

module.exports = router;
