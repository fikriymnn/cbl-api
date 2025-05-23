const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiAmparLemPoint = require("../../../../controller/qc/inspeksi/amparLem/inspeksiAmparLemPointController");

router.put(
  "/qc/cs/inspeksiAmparLemPoint/start/:id",
  auth,
  inspeksiAmparLemPoint.startAmparLemPoint
);

router.put(
  "/qc/cs/inspeksiAmparLemPoint/stop/:id",
  auth,
  inspeksiAmparLemPoint.stopRabutPoint
);

router.post(
  "/qc/cs/inspeksiAmparLemPoint/create",
  auth,
  inspeksiAmparLemPoint.createInspeksiAmparLemPoint
);

router.post(
  "/qc/cs/inspeksiAmparLemPoint/createDefect",
  auth,
  inspeksiAmparLemPoint.createInspeksiAmparLemPointDefect
);

router.put(
  "/qc/cs/inspeksiAmparLemPoint/istirahat/:id",
  auth,
  inspeksiAmparLemPoint.istirahatAmparLemPoint
);
router.put(
  "/qc/cs/inspeksiAmparLemPoint/istirahatMasuk/:id",
  auth,
  inspeksiAmparLemPoint.istirahatMasukAmparLemPoint
);

module.exports = router;
