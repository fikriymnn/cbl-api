const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiLemPeriodePoint = require("../../../../controller/qc/inspeksi/lem/inspeksiLemPeriodePointController");

router.put(
  "/qc/cs/inspeksiLemPeriodePoint/start/:id",
  auth,
  inspeksiLemPeriodePoint.startLemPeriodePoint
);

router.put(
  "/qc/cs/inspeksiLemPeriodePoint/stop/:id",
  auth,
  inspeksiLemPeriodePoint.stopLemPeriodePoint
);

router.post(
  "/qc/cs/inspeksiLemPeriodePoint/create",
  auth,
  inspeksiLemPeriodePoint.createInspeksiLemPeriodePoint
);

router.delete(
  "/qc/cs/inspeksiLemPeriodePoint/delete/:id",
  auth,
  inspeksiLemPeriodePoint.deleteLemPeriodePoint
);

module.exports = router;
