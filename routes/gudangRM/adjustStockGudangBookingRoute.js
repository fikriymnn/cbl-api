const router = require("express").Router();
const AdjustStockGudangBookingController = require("../../controller/gudangRM/adjustStockGudangBooking/adjustStockGudangBookingController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/rm/adjustStockGudangBooking/:id?",
  auth,
  AdjustStockGudangBookingController.getAdjustStockRawMaterialBooking,
);
router.post(
  "/rm/adjustStockGudangBooking",
  auth,
  AdjustStockGudangBookingController.createAdjustStockRawMaterialBooking,
);

router.put(
  "/rm/adjustStockGudangBooking/:id?",
  auth,
  AdjustStockGudangBookingController.updateAdjustStockRawMaterialBooking,
);

module.exports = router;
