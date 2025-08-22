const router = require("express").Router();
const MasterTahapanController = require("../../../controller/masterData/tahapan/masterTahapanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/tahapan/:id?",
  auth,
  MasterTahapanController.getMasterTahapan
);
router.post(
  "/master/tahapan",
  auth,
  MasterTahapanController.createMasterTahapan
);
router.put(
  "/master/tahapan/:id",
  auth,
  MasterTahapanController.updateMasterTahapan
);
router.delete(
  "/master/tahapan/:id",
  auth,
  MasterTahapanController.deleteMasterTahapan
);

module.exports = router;
