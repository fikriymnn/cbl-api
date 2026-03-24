const router = require("express").Router();
const GudangFinishGood = require("../../controller/finishGood/gudangFinishGood/gudangFinishGoodController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/fg/gudangFinishGood/:id?",
  auth,
  GudangFinishGood.getGudangFinishGood,
);

router.get(
  "/fg/gudangFinishGoodByIo",
  auth,
  GudangFinishGood.getGudangFinishGoodByIo,
);

router.post(
  "/fg/gudangFinishGood/sendDo/single",
  auth,
  GudangFinishGood.sendDoGudangFinishGoodSingle,
);

router.post(
  "/fg/gudangFinishGood/sendDo/group",
  auth,
  GudangFinishGood.sendDoGudangFinishGoodGroup,
);

module.exports = router;
