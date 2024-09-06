const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiRabutPoint = require("../../../../controller/qc/inspeksi/rabut/inspeksiRabutPointController");

router.put(
  "/qc/cs/inspeksiRabutPoint/start/:id",
  auth,
  inspeksiRabutPoint.startRabutPoint
);

router.put(
  "/qc/cs/inspeksiRabutPoint/stop/:id",
  auth,
  inspeksiRabutPoint.stopRabutPoint
);

router.post(
  "/qc/cs/inspeksiRabutPoint/create",
  auth,
  inspeksiRabutPoint.createInspeksiRabutPoint
);

router.post(
  "/qc/cs/inspeksiRabutPoint/createDefect",
  auth,
  inspeksiRabutPoint.createInspeksiRabutPointDefect
);

module.exports = router;
