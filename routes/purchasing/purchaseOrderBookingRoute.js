const router = require("express").Router();
const PurchaseOrderBooking = require("../../controller/purchasing/purchaseOrderBooking/purchaseOrderBookingController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/purchasing/purchaseOrderBooking/:id?",
  auth,
  PurchaseOrderBooking.getPurchaseOrderBooking,
);

router.get(
  "/purchasing/purchaseOrderBooking/getNo/new",
  auth,
  PurchaseOrderBooking.getNoPurchaseOrderBooking,
);

router.post(
  "/purchasing/purchaseOrderBooking",
  auth,
  PurchaseOrderBooking.createPurchaseOrderBooking,
);

router.put(
  "/purchasing/purchaseOrderBooking/:id",
  auth,
  PurchaseOrderBooking.updatePurchaseOrderBooking,
);

router.put(
  "/purchasing/purchaseOrderBooking/request/:id",
  auth,
  PurchaseOrderBooking.requestPurchaseOrderBooking,
);

router.put(
  "/purchasing/purchaseOrderBooking/approveKabag/:id",
  auth,
  PurchaseOrderBooking.approveKabagPurchaseOrderBooking,
);

router.put(
  "/purchasing/purchaseOrderBooking/approveFinance/:id",
  auth,
  PurchaseOrderBooking.approveFinancePurchaseOrderBooking,
);

router.put(
  "/purchasing/purchaseOrderBooking/rejectKabag/:id",
  auth,
  PurchaseOrderBooking.rejectKabagPurchaseOrderBooking,
);

router.put(
  "/purchasing/purchaseOrderBooking/rejectFinance/:id",
  auth,
  PurchaseOrderBooking.rejectFinancePurchaseOrderBooking,
);

router.put(
  "/purchasing/purchaseOrderBooking/close/:id",
  auth,
  PurchaseOrderBooking.closePurchaseOrderBooking,
);

module.exports = router;
