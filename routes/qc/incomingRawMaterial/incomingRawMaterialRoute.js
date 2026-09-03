const router = require("express").Router();
const IncomingRawMaterial = require("../../../controller/qc/incomingRawMaterial/incomingRawMaterialController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/qc/incomingRawMaterial/:id?",
  auth,
  IncomingRawMaterial.getIncomingRawMaterial,
);

router.get(
  "/qc/incomingRawMaterialNoSuratJalan",
  auth,
  IncomingRawMaterial.getnoSuratJalan,
);

router.post(
  "/qc/incomingRawMaterial",
  auth,
  IncomingRawMaterial.createIncomingRawMaterial,
);

router.put(
  "/qc/incomingRawMaterial/approve/:id",
  auth,
  IncomingRawMaterial.approveIncomingRawMaterial,
);

router.put(
  "/qc/incomingRawMaterial/reject/:id",
  auth,
  IncomingRawMaterial.rejectIncomingRawMaterial,
);

module.exports = router;
