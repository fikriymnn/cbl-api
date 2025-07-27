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

router.put(
  "/qc/cs/inspeksiRabutPoint/edit/:id",
  auth,
  inspeksiRabutPoint.updateInspeksiRabutPoint
);

router.post(
  "/qc/cs/inspeksiRabutPoint/createDefect",
  auth,
  inspeksiRabutPoint.createInspeksiRabutPointDefect
);

router.put(
  "/qc/cs/inspeksiRabutPoint/istirahat/:id",
  auth,
  inspeksiRabutPoint.istirahatRabutPoint
);

router.put(
  "/qc/cs/inspeksiRabutPoint/istirahatMasuk/:id",
  auth,
  inspeksiRabutPoint.istirahatMasukRabutPoint
);

module.exports = router;
