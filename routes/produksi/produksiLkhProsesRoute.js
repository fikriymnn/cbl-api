const router = require("express").Router();
const ProduksiLkhProsesController = require("../../controller/produksi/produksiLkhProsesController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/produksi/lkhProses",
  auth,
  ProduksiLkhProsesController.getProduksiLkhProses
);

router.put(
  "/produksi/lkhProses/start",
  auth,
  ProduksiLkhProsesController.startProduksiLkhProses
);
router.put(
  "/produksi/lkhProses/stop/:id",
  auth,
  ProduksiLkhProsesController.stopProduksiLkhProses
);

router.put(
  "/produksi/lkhProses/approveSpv/:id",
  auth,
  ProduksiLkhProsesController.approveSpvProduksiLkhProses
);

module.exports = router;
