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

module.exports = router;
