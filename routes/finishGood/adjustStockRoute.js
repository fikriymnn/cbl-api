const router = require("express").Router();
const AdjustStockController = require("../../controller/finishGood/adjustStok/adjustStockController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/fg/adjustStock/:id?", auth, AdjustStockController.getAdjustStock);
router.post("/fg/adjustStock", auth, AdjustStockController.createAdjustStock);

router.put(
  "/fg/adjustStock/:id?",
  auth,
  AdjustStockController.updateAdjustStock,
);

module.exports = router;
