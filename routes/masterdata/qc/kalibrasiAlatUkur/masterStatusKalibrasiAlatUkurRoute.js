const router = require("express").Router();
const masterStatusKalibrasiAlatUkur = require("../../../../controller/masterData/qc/kalibrasiAlatUkur/masterStatusKalibrasiAlatUkurController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/statusKalibrasi/:id?",
  masterStatusKalibrasiAlatUkur.getMasterStatusKalibrasiAlatUkur
);
router.post(
  "/master/qc/statusKalibrasi",
  auth,
  masterStatusKalibrasiAlatUkur.createMasterStatusKalibrasiAlatUkur
);
router.put(
  "/master/qc/statusKalibrasi/:id",
  auth,
  masterStatusKalibrasiAlatUkur.updateMasterStatusKalibrasiAlatUkur
);

module.exports = router;
