const router = require("express").Router();
const StockOpnameController = require("../../controller/finishGood/stockOpname/stockOpnameController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/fg/stockOpname/:id?", auth, StockOpnameController.getStockOpname);
router.post("/fg/stockOpname", auth, StockOpnameController.createStockOpname);
router.put(
  "/fg/stockOpname/request/:id",
  auth,
  StockOpnameController.requestStockOpname,
);
router.put(
  "/fg/stockOpname/approve/:id",
  auth,
  StockOpnameController.approveStockOpname,
);
router.put(
  "/fg/stockOpname/reject/:id",
  auth,
  StockOpnameController.rejectStockOpname,
);

router.put(
  "/fg/stockOpnameItem/save/:id",
  auth,
  StockOpnameController.saveStockOpnameItem,
);
router.put(
  "/fg/stockOpnameItem/approve",
  auth,
  StockOpnameController.approveStockOpnameItem,
);
router.put(
  "/fg/stockOpnameItem/reject",
  auth,
  StockOpnameController.rejectStockOpnameItem,
);
router.put(
  "/fg/stockOpnameItem/update/:id",
  auth,
  StockOpnameController.updateStockOpnameItem,
);

module.exports = router;
