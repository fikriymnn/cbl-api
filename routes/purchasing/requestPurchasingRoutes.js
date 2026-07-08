const router = require("express").Router();
const RequestPurchasingController = require("../../controller/purchasing/requestPurchase/requestPurchaseController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/purchasing/request/:id?",
  auth,
  RequestPurchasingController.getRequestPurchasing,
);
router.post(
  "/purchasing/request",
  auth,
  RequestPurchasingController.createRequestPurchasing,
);

module.exports = router;
