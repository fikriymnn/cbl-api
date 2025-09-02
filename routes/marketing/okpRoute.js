const router = require("express").Router();
const OkpController = require("../../controller/marketing/okp/okpController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/marketing/okp/:id?", auth, OkpController.getOkp);
router.post("/marketing/okp", auth, OkpController.createOkp);
router.put("/marketing/okp/:id", auth, OkpController.updateOkp);
router.put(
  "/marketing/okp/proses/action/:id",
  auth,
  OkpController.actionProsesTanggalOkp
);
router.put(
  "/marketing/okp/proses/reject/:id",
  auth,
  OkpController.rejectProsesTanggalOkp
);
router.put("/marketing/okp/approve/:id", auth, OkpController.approveOkp);
router.put("/marketing/okp/reject/:id", auth, OkpController.rejectOkp);
router.delete("/marketing/okp/:id", auth, OkpController.deleteOkp);

module.exports = router;
