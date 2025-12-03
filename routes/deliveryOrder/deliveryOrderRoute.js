const router = require("express").Router();
const DeliveryOrderController = require("../../controller/deliveryOrder/deliveryOrderController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/deliveryOrder/:id?",
  auth,
  DeliveryOrderController.getProduksiJoDone
);

module.exports = router;
