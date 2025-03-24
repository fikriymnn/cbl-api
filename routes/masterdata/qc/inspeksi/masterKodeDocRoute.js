const router = require("express").Router();
const MasterKodeDocController = require("../../../../controller/masterData/qc/inspeksi/masterkodeDocController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/kodeDoc/:id?",
  MasterKodeDocController.getMasterKodeDocInspeksi
);
router.post(
  "/master/qc/cs/kodeDoc",
  auth,
  MasterKodeDocController.createMasterKodeDocInspeksi
);
router.put(
  "/master/qc/cs/kodeDoc/:id",
  auth,
  MasterKodeDocController.updateMasterKodeDocInspeksi
);
router.delete(
  "/master/qc/cs/kodeDoc/:id",
  auth,
  MasterKodeDocController.deleteMasterKodeDocInspeksi
);

module.exports = router;
