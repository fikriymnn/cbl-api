const router = require("express").Router();
const MasterMesinTahapanController = require("../../../controller/masterData/tahapan/masterMesinTahapanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/mesinTahapan/:id?",
  auth,
  MasterMesinTahapanController.getMasterMesinTahapan
);
router.post(
  "/master/mesinTahapan",
  auth,
  MasterMesinTahapanController.createMasterMesinTahapan
);
router.put(
  "/master/mesinTahapan/:id",
  auth,
  MasterMesinTahapanController.updateMasterMesinTahapan
);
router.delete(
  "/master/mesinTahapan/:id",
  auth,
  MasterMesinTahapanController.deleteMasterMesinTahapan
);

module.exports = router;
