const router = require("express").Router();
const OutstandingAbsenController = require("../../../../controller/hr/outstanding/outstandingAbsen/outstandingAbsenController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get("/outstandingAbsen", OutstandingAbsenController.getOutstandingAbsen);
router.put(
  "/outstandingAbsen/done/:id",
  auth,
  OutstandingAbsenController.doneOutstandingAbsen
);
router.get(
  "/outstandingAbsenCronjob",
  OutstandingAbsenController.getCronjobOutstandingAbsen
);

module.exports = router;
