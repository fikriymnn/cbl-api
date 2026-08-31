const router = require("express").Router();
const StockOpnameRawMaterialController = require("../../controller/gudangRM/stockOpnameRawMaterial/stockOpnameRawMaterialController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/rm/stockOpname/:id?",
  auth,
  StockOpnameRawMaterialController.getStockOpnameRawMaterial,
);
router.post(
  "/rm/stockOpname",
  auth,
  StockOpnameRawMaterialController.createStockOpnameRawMaterial,
);
router.put(
  "/rm/stockOpname/request/:id",
  auth,
  StockOpnameRawMaterialController.requestStockOpnameRawMaterial,
);
router.put(
  "/rm/stockOpname/approve/:id",
  auth,
  StockOpnameRawMaterialController.approveStockOpnameRawMaterial,
);
router.put(
  "/rm/stockOpname/reject/:id",
  auth,
  StockOpnameRawMaterialController.rejectStockOpnameRawMaterial,
);

router.put(
  "/rm/stockOpnameItem/save/:id",
  auth,
  StockOpnameRawMaterialController.saveStockOpnameRawMaterialItem,
);
router.put(
  "/rm/stockOpnameItem/approve",
  auth,
  StockOpnameRawMaterialController.approveStockOpnameRawMaterialItem,
);
router.put(
  "/rm/stockOpnameItem/reject",
  auth,
  StockOpnameRawMaterialController.rejectStockOpnameRawMaterialItem,
);
router.put(
  "/rm/stockOpnameItem/update/:id",
  auth,
  StockOpnameRawMaterialController.updateStockOpnameRawMaterialItem,
);

module.exports = router;
