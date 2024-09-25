const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const incomingOutsourcing = require("../../../../controller/qc/inspeksi/incomingOutsourcing/incomingOutsourcingController");

router.get(
  "/qc/cs/incomingOutsourcing/:id?",
  auth,
  incomingOutsourcing.getIncomingOutsourcing
);
router.get(
  "/qc/cs/incomingOutsourcingMesin",
  auth,
  incomingOutsourcing.getIncomingOutsourcingMesin
);
router.post(
  "/qc/cs/incomingOutsourcing",
  incomingOutsourcing.createIncomingOutsourcing
);
//update
router.put(
  "/qc/cs/incomingOutsourcing/update/:id",
  incomingOutsourcing.updateIncomingOutsourcing
);
// start and stop
router.get(
  "/qc/cs/incomingOutsourcing/start/:id",
  auth,
  incomingOutsourcing.startIncomingOutsourcing
);

router.put(
  "/qc/cs/incomingOutsourcing/done/:id",
  incomingOutsourcing.doneIncomingOutsourcing
);

module.exports = router;
