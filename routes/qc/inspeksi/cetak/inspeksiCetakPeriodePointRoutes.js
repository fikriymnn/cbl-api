const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetakPeriodePoint = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakPeriodePointController");

router.put(
  "/qc/cs/inspeksiCetakPeriodePoint/start/:id",
  auth,
  inspeksiCetakPeriodePoint.startCetakPeriodePoint
);

router.put(
  "/qc/cs/inspeksiCetakPeriodePoint/stop/:id",
  auth,
  inspeksiCetakPeriodePoint.stopCetakPeriodePoint
);

router.post(
  "/qc/cs/inspeksiCetakPeriodePoint/create",
  auth,
  inspeksiCetakPeriodePoint.createInspeksiCetakPeriodePoint
);

router.delete(
  "/qc/cs/inspeksiCetakPeriodePoint/delete/:id",
  auth,
  inspeksiCetakPeriodePoint.deleteInspeksiCetakPeriodePoint
);

module.exports = router;
