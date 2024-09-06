const router = require("express").Router();
const kodeMasalahRabutController = require("../../../../controller/masterData/qc/inspeksi/masterKodeMasalahSamplingRabutController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/masalahRabut/:id?",
  kodeMasalahRabutController.getMasterKodeMasalahSamplingHasilRabut
);
router.post(
  "/master/qc/cs/masalahRabut",
  auth,
  kodeMasalahRabutController.createMasterKodeMasalahSamplingHasilRabut
);
router.put(
  "/master/qc/cs/masalahRabut/:id",
  auth,
  kodeMasalahRabutController.updateMasterKodeMasalahSamplingHasilRabut
);
router.delete(
  "/master/qc/cs/masalahRabut/:id",
  auth,
  kodeMasalahRabutController.deleteMasterKodeMasalahSamplingHasilRabut
);

module.exports = router;
