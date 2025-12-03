const router = require("express").Router();
const DeliveryOrderGroupController = require("../../controller/deliveryOrder/deliveryOrderGroupController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/deliveryOrderGroup/:id?",
  auth,
  DeliveryOrderGroupController.getDeliveryOrderGroup
);
router.post(
  "/deliveryOrderGroup",
  auth,
  DeliveryOrderGroupController.createDeliveryOrderGroup
);
router.put(
  "/deliveryOrderGroup/konfirmasi/:id",
  auth,
  DeliveryOrderGroupController.konfirmasiDeliveryOrderGroup
);

module.exports = router;
