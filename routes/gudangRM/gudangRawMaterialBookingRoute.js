const router = require("express").Router();
const GudangRawMaterialBookingController = require("../../controller/gudangRM/gudangRawMaterialBooking/gudangRawMaterialBookingController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/rm/gudangBooking/:id?",
  auth,
  GudangRawMaterialBookingController.getGudangRawMaterialBooking,
);

router.put(
  "/rm/gudangBooking/approve/:id",
  auth,
  GudangRawMaterialBookingController.approveGudangRawMaterialBooking,
);

module.exports = router;
