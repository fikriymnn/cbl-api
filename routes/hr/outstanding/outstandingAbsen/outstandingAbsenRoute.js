const router = require("express").Router();
const OutstandingAbsenController = require("../../../../controller/hr/outstanding/outstandingAbsen/outstandingAbsenController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/hr/outstandingAbsen",
  OutstandingAbsenController.getOutstandingAbsen
);
router.put(
  "/hr/outstandingAbsen/done/:id",
  auth,
  OutstandingAbsenController.doneOutstandingAbsen
);
router.get(
  "/hr/outstandingAbsenCronjob",
  OutstandingAbsenController.getCronjobOutstandingAbsen
);

module.exports = router;
