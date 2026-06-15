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

router.get(
  "/fg/gudangFinishGoodByJo",
  auth,
  GudangFinishGood.getGudangFinishGoodByJo,
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

//untuk keperluan booking

router.get(
  "/fg/getJoNormalBookingFG/:id?",
  auth,
  GudangFinishGood.getJoBookingNormalFG,
);

router.get(
  "/fg/getJoKanbanBookingFG/:id?",
  auth,
  GudangFinishGood.getJoBookingKanbanFG,
);

router.post(
  "/fg/gudangFinishGood/bookingJo",
  auth,
  GudangFinishGood.bookingDoGudangFinishGood,
);

module.exports = router;
