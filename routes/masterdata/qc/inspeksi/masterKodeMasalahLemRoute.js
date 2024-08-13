const router = require("express").Router();
const kodeMasalahLemController = require("../../../../controller/masterData/qc/inspeksi/masterKodeMasalahLemController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/masalahLem/:id?",
  kodeMasalahLemController.getMasterKodeMasalahLem
);
router.post(
  "/master/qc/cs/masalahLem",
  auth,
  kodeMasalahLemController.createMasterKodeMasalahLem
);
router.put(
  "/master/qc/cs/masalahLem/:id",
  auth,
  kodeMasalahLemController.updateMasterKodeMasalahLem
);
router.delete(
  "/master/qc/cs/masalahLem/:id",
  auth,
  kodeMasalahLemController.deleteMasterKodeMasalahLem
);

module.exports = router;
