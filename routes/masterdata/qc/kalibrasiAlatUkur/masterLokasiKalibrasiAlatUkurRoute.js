const router = require("express").Router();
const masterLokasiKalibrasiAlatUkur = require("../../../../controller/masterData/qc/kalibrasiAlatUkur/masterLokasiKalibrasiAlatUkurController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/lokasiKalibrasi/:id?",
  masterLokasiKalibrasiAlatUkur.getMasterLokasiKalibrasiAlatUkur
);
router.post(
  "/master/qc/lokasiKalibrasi",
  auth,
  masterLokasiKalibrasiAlatUkur.createMasterLokasiKalibrasiAlatUkur
);
router.put(
  "/master/qc/lokasiKalibrasi/:id",
  auth,
  masterLokasiKalibrasiAlatUkur.updateMasterLokasiKalibrasiAlatUkur
);

module.exports = router;
