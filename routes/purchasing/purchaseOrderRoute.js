const router = require("express").Router();
const PurchaseOrder = require("../../controller/purchasing/purchaseOrder/purchaseOrderController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/purchasing/purchaseOrder/:id?",
  auth,
  PurchaseOrder.getPurchaseOrder,
);

router.get(
  "/purchasing/purchaseOrder/getNo/new",
  auth,
  PurchaseOrder.getNoPurchaseOrder,
);

router.post(
  "/purchasing/purchaseOrder",
  auth,
  PurchaseOrder.createPurchaseOrder,
);

router.put(
  "/purchasing/purchaseOrder/:id",
  auth,
  PurchaseOrder.updatePurchaseOrder,
);

router.put(
  "/purchasing/purchaseOrder/request/:id",
  auth,
  PurchaseOrder.requestPurchaseOrder,
);

router.put(
  "/purchasing/purchaseOrder/approveKabag/:id",
  auth,
  PurchaseOrder.approveKabagPurchaseOrder,
);

router.put(
  "/purchasing/purchaseOrder/approveFinance/:id",
  auth,
  PurchaseOrder.approveFinancePurchaseOrder,
);

router.put(
  "/purchasing/purchaseOrder/rejectKabag/:id",
  auth,
  PurchaseOrder.rejectKabagPurchaseOrder,
);

router.put(
  "/purchasing/purchaseOrder/rejectFinance/:id",
  auth,
  PurchaseOrder.rejectFinancePurchaseOrder,
);

module.exports = router;
