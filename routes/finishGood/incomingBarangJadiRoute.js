const router = require("express").Router();
const IncomingBarangJadiController = require("../../controller/finishGood/incomingBarangJadi/incomingBarangJadiController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/fg/incomingBarangJadi/:id?",
  auth,
  IncomingBarangJadiController.getIncomingBarangJadi,
);

router.put(
  "/fg/incomingBarangJadi/approve/:id?",
  auth,
  IncomingBarangJadiController.approveIncomingBarangJadi,
);

router.put(
  "/fg/incomingBarangJadi/reject/:id?",
  auth,
  IncomingBarangJadiController.rejectIncomingBarangJadi,
);

module.exports = router;
