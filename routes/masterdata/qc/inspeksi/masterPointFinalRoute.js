const router = require("express").Router();
const pointFinalController = require("../../../../controller/masterData/qc/inspeksi/masterPointFinalController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/pointfinal/:id?",
  pointFinalController.getMasterPointFinal);
router.post(
  "/master/qc/cs/pointfinal",
  auth,
  pointFinalController.createMasterPointFinal
);
router.put(
  "/master/qc/cs/pointfinal/:id",
  auth,
  pointFinalController.updateMasterPointFinal
);
router.delete(
  "/master/qc/cs/pointfinal/:id",
  auth,
  pointFinalController.deleteMasterPointFinal
);

module.exports = router;