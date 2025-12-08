const router = require("express").Router();
const masterKendaraanController = require("../../../controller/masterData/kendaraan/masterKendaraanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/kendaraan/:id?",
  masterKendaraanController.getMasterKendaraan
);
router.post(
  "/master/kendaraan",
  auth,
  masterKendaraanController.createMasterKendaraan
);
router.put(
  "/master/kendaraan/:id",
  auth,
  masterKendaraanController.updateMasterKendaraan
);
router.delete(
  "/master/kendaraan/:id",
  auth,
  masterKendaraanController.deleteMasterKendaraan
);

module.exports = router;
