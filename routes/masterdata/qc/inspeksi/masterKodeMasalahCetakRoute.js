const router = require("express").Router();
const kodeMasalahCetakController = require("../../../../controller/masterData/qc/inspeksi/masterKodeMasalahCetakController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/masalahCetak/:id?",
  kodeMasalahCetakController.getMasterKodeMasalahCetak
);
router.post(
  "/master/qc/cs/masalahCetak",
  auth,
  kodeMasalahCetakController.createMasterKodeMasalahCetak
);
router.put(
  "/master/qc/cs/masalahCetak/:id",
  auth,
  kodeMasalahCetakController.updateMasterKodeMasalahCetak
);
router.delete(
  "/master/qc/cs/masalahCetak/:id",
  auth,
  kodeMasalahCetakController.deleteMasterKodeMasalahCetak
);

module.exports = router;
