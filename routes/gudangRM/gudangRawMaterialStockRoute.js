const router = require("express").Router();
const GudangRawMaterialStockController = require("../../controller/gudangRM/gudangRawMaterialStock/gudangRawMaterialStockController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/rm/gudangStock/:id?",
  auth,
  GudangRawMaterialStockController.getGudangRawMaterialStock,
);

router.get(
  "/rm/gudangStockMutasi/:id?",
  auth,
  GudangRawMaterialStockController.getGudangRawMaterialStockMutasi,
);

router.post(
  "/rm/gudangStock",
  auth,
  GudangRawMaterialStockController.createGudangRawMaterialStock,
);

module.exports = router;
