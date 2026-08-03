const router = require("express").Router();
const BapController = require("../../controller/finishGood/bap/bapConttroller");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/fg/bap/:id?", auth, BapController.getBap);
router.post("/fg/bap", auth, BapController.createBap);
router.put("/fg/bap/done/:id", auth, BapController.doneBap);

router.get("/fg/bapItem/:id?", auth, BapController.getBapItem);
router.put("/fg/bapItem/approve/:id", auth, BapController.approveBapItem);
router.put("/fg/bapItem/reject/:id", auth, BapController.rejectBapItem);

module.exports = router;
