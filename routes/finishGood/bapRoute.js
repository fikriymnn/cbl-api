const router = require("express").Router();
const BapController = require("../../controller/finishGood/bap/bapController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/fg/bap/:id?", auth, BapController.getBap);
router.post("/fg/bap", auth, BapController.createBap);
router.put("/fg/bap/done/:id", auth, BapController.doneBap);
router.put("/fg/bap/updateFile/:id", auth, BapController.updateFileBap);

router.get("/fg/bapItem/:id?", auth, BapController.getBapItem);
router.put(
  "/fg/bapItemMarketing/approve/:id",
  auth,
  BapController.approveMarketingBapItem,
);
router.put("/fg/bapItem/approve/:id", auth, BapController.approveBapItem);
router.put("/fg/bapItem/reject/:id", auth, BapController.rejectBapItem);

module.exports = router;
