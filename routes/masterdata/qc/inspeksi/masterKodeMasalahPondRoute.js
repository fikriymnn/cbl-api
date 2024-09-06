const router = require("express").Router();
const kodeMasalahPondController = require("../../../../controller/masterData/qc/inspeksi/masterKodeMasalahPondController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/masalahPond/:id?",
  kodeMasalahPondController.getMasterKodeMasalahPond
);
router.post(
  "/master/qc/cs/masalahPond",
  auth,
  kodeMasalahPondController.createMasterKodeMasalahPond
);
router.put(
  "/master/qc/cs/masalahPond/:id",
  auth,
  kodeMasalahPondController.updateMasterKodeMasalahPond
);
router.delete(
  "/master/qc/cs/masalahPond/:id",
  auth,
  kodeMasalahPondController.deleteMasterKodeMasalahPond
);

module.exports = router;
