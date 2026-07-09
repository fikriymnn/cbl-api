const router = require("express").Router();
const RequestPurchasingController = require("../../controller/purchasing/requestPurchase/requestPurchaseController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/purchasing/request/:id?",
  auth,
  RequestPurchasingController.getRequestPurchasing
);

router.get(
  "/purchasing/rekapRequestTipeBarang",
  auth,
  RequestPurchasingController.getRekapTipeBarangPurchasing
);
router.post(
  "/purchasing/request",
  auth,
  RequestPurchasingController.createRequestPurchasing
);

module.exports = router;
