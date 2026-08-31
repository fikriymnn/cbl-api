const router = require("express").Router();
const OutstandingStockRawMaterialController = require("../../controller/gudangRM/outstandingStockRawMaterial/outstandingStockRawMaterialController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/rm/outstandingStock/:id?",
  auth,
  OutstandingStockRawMaterialController.getOutstandingStockRawMaterial,
);

router.put(
  "/rm/outstandingStock/approve/:id",
  auth,
  OutstandingStockRawMaterialController.approveOutstandingStockRawMaterial,
);

module.exports = router;
