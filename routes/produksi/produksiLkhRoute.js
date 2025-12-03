const router = require("express").Router();
const ProduksiLkhController = require("../../controller/produksi/produksiLkhController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/produksi/lkh/:id?", auth, ProduksiLkhController.getProduksiLkh);
router.put(
  "/produksi/lkh/finish/:id",
  auth,
  ProduksiLkhController.finishProduksiLkh
);

router.get(
  "/produksi/listAllData/:id?",
  auth,
  ProduksiLkhController.getProduksiLkhAllData
);

module.exports = router;
