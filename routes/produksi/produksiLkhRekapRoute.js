const router = require("express").Router();
const ProduksiLkhRekapController = require("../../controller/produksi/produksiLkhRekapController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/produksi/lkhRekap",
  auth,
  ProduksiLkhRekapController.getProduksiLkhRekap
);

module.exports = router;
