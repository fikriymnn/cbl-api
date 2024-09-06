const router = require("express").Router();
const subFinalController = require("../../../../controller/masterData/qc/inspeksi/masterSubFinalController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/subfinal/:id?",
  subFinalController.getMasterSubFinal);
router.post(
  "/master/qc/cs/subfinal",
  auth,
  subFinalController.createMasterSubFinal
);
router.put(
  "/master/qc/cs/subfinal/:id",
  auth,
  subFinalController.updateMasterSubFinal
);
router.delete(
  "/master/qc/cs/subfinal/:id",
  auth,
  subFinalController.deleteMasterSubFinal
);

module.exports = router;