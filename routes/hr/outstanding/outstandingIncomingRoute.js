const router = require("express").Router();
const OutstandingKaryawanController = require("../../../controller/hr/outstanding/outstandingIncomingController");
const { auth } = require("../../../middlewares/authMiddlewares");

//untuk outstanding yang belum di kerjakan hr
router.get(
  "/hr/outstandingIncoming",
  OutstandingKaryawanController.getOutstandingIncomingHr
);

module.exports = router;
