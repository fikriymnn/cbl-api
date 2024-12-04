const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPondPeriodePoint = require("../../../../controller/qc/inspeksi/pond/inspeksiPondPeriodePointController");

router.put(
  "/qc/cs/inspeksiPondPeriodePoint/start/:id",
  auth,
  inspeksiPondPeriodePoint.startPondPeriodePoint
);

router.put(
  "/qc/cs/inspeksiPondPeriodePoint/stop/:id",
  auth,
  inspeksiPondPeriodePoint.stopPondPeriodePoint
);

router.post(
  "/qc/cs/inspeksiPondPeriodePoint/create",
  auth,
  inspeksiPondPeriodePoint.createInspeksiPondPeriodePoint
);

router.delete(
  "/qc/cs/inspeksiPondPeriodePoint/delete/:id",
  auth,
  inspeksiPondPeriodePoint.deletePondPeriodePoint
);

module.exports = router;
