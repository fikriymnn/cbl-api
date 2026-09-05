const router = require("express").Router();
const RequestCancelPurchaseOrder = require("../../controller/purchasing/requestCancelPurchaseOrder/requestCancelPurchaseOrderController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/purchasing/requestCancelpurchaseOrder/:id?",
  auth,
  RequestCancelPurchaseOrder.getRequestCancelPurchaseOrder,
);

router.post(
  "/purchasing/requestCancelpurchaseOrder",
  auth,
  RequestCancelPurchaseOrder.createRequestCancelPurchaseOrder,
);

router.put(
  "/purchasing/requestCancelpurchaseOrder/approve/:id",
  auth,
  RequestCancelPurchaseOrder.approveRequestCancelPurchaseOrder,
);

router.put(
  "/purchasing/requestCancelpurchaseOrder/reject/:id",
  auth,
  RequestCancelPurchaseOrder.rejectRequestCancelPurchaseOrder,
);

module.exports = router;
