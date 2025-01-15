const router = require("express").Router();
const OutstandingKaryawanController = require("../../../../controller/hr/outstanding/outstandingKaryawan/outstandingKaryawanController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/outstandingKaryawan",
  OutstandingKaryawanController.getOutstandingKaryawan
);
router.put(
  "/outstandingKaryawan/done/:id",
  auth,
  OutstandingKaryawanController.doneOutstandingKaryawan
);
router.get(
  "/outstandingKaryawanCronjob",
  OutstandingKaryawanController.getCronjobOutstandingKaryawan
);

module.exports = router;
