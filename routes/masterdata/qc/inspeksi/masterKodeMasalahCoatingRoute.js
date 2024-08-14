const router = require("express").Router();
const kodeMasalahCoatingController = require("../../../../controller/masterData/qc/inspeksi/masterKodeMasalahCoatingController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/masalahCoating/:id?",
  kodeMasalahCoatingController.getMasterKodeMasalahCoating
);
router.post(
  "/master/qc/cs/masalahCoating",
  auth,
  kodeMasalahCoatingController.createMasterKodeMasalahCoating
);
router.put(
  "/master/qc/cs/masalahCoating/:id",
  auth,
  kodeMasalahCoatingController.updateMasterKodeMasalahCoating
);
router.delete(
  "/master/qc/cs/masalahCoating/:id",
  auth,
  kodeMasalahCoatingController.deleteMasterKodeMasalahCoating
);

module.exports = router;