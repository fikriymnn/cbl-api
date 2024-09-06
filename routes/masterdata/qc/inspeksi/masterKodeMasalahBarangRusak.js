const router = require("express").Router();
const kodeMasalahBarangRusakController = require("../../../../controller/masterData/qc/inspeksi/masterKodeMasalahBarangRusak");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/masalahbarangRusak/:id?",
  kodeMasalahBarangRusakController.getMasterKodeMasalahBarangRusak
);
router.post(
  "/master/qc/cs/masalahBarangRusak",
  auth,
  kodeMasalahBarangRusakController.createMasterKodeMasalahBarangRusak
);
router.put(
  "/master/qc/cs/masalahBarangRusak/:id",
  auth,
  kodeMasalahBarangRusakController.updateMasterKodeMasalahBarangRusak
);
router.delete(
  "/master/qc/cs/masalahBarangRusak/:id",
  auth,
  kodeMasalahBarangRusakController.deleteMasterKodeMasalahBarangRusak
);

module.exports = router;
