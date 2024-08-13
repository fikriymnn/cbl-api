const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiLemAwalPoint = require("../../../../controller/qc/inspeksi/lem/inspeksiLemAwalPointController");

router.put(
  "/qc/cs/inspeksiLemAwalPoint/start/:id",
  auth,
  inspeksiLemAwalPoint.startLemAwalPoint
);

router.put(
  "/qc/cs/inspeksiLemAwalPoint/stop/:id",
  auth,
  inspeksiLemAwalPoint.stopLemAwalPoint
);

router.post(
  "/qc/cs/inspeksiLemAwalPoint/create",
  auth,
  inspeksiLemAwalPoint.createInspeksiLemAwalPoint
);

module.exports = router;
