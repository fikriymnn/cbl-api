const router = require("express").Router();
const ProduksiLkhWasteController = require("../../controller/produksi/produksiLkhWasteController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/produksi/lkhWaste/:id?",
  auth,
  ProduksiLkhWasteController.getProduksiLkhWaste,
);

router.post(
  "/produksi/lkhWaste",
  auth,
  ProduksiLkhWasteController.createProduksiLkhWaste,
);

module.exports = router;
