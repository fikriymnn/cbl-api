const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPondAwalPoint = require("../../../../controller/qc/inspeksi/pond/inspeksiPondAwalPointController");

router.put(
  "/qc/cs/inspeksiPondAwalPoint/start/:id",
  auth,
  inspeksiPondAwalPoint.startPondAwalPoint
);

router.put(
  "/qc/cs/inspeksiPondAwalPoint/stop/:id",
  auth,
  inspeksiPondAwalPoint.stopPondAwalPoint
);

router.post(
  "/qc/cs/inspeksiPondAwalPoint/create",
  auth,
  inspeksiPondAwalPoint.createInspeksiPondAwalPoint
);

module.exports = router;
