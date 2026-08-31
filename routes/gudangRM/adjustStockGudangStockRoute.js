const router = require("express").Router();
const AdjustStockGudangStockController = require("../../controller/gudangRM/adjuatStockGudangStock/adjustStockGudangStockController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/rm/adjustStockGudangStock/:id?",
  auth,
  AdjustStockGudangStockController.getAdjustStockRawMaterialStock,
);
router.post(
  "/rm/adjustStockGudangStock",
  auth,
  AdjustStockGudangStockController.createAdjustStockRawMaterialStock,
);

router.put(
  "/rm/adjustStockGudangStock/:id?",
  auth,
  AdjustStockGudangStockController.updateAdjustStockRawMaterialStock,
);

module.exports = router;
