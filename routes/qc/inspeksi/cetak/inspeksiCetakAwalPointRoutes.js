const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetakAwalPoint = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakAwalPointController");

router.put(
  "/qc/cs/inspeksiCetakAwalPoint/start/:id",
  auth,
  inspeksiCetakAwalPoint.startCetakAwalPoint
);

router.put(
  "/qc/cs/inspeksiCetakAwalPoint/stop/:id",
  auth,
  inspeksiCetakAwalPoint.stopCetakAwalPoint
);

router.post(
  "/qc/cs/inspeksiCetakAwalPoint/create",
  auth,
  inspeksiCetakAwalPoint.createInspeksiCetakAwalPoint
);

module.exports = router;
