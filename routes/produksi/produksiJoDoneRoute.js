const router = require("express").Router();
const ProduksiJoDoneController = require("../../controller/produksi/produksiJoDoneController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/produksi/joDone/:id?",
  auth,
  ProduksiJoDoneController.getProduksiJoDone
);
router.put(
  "/produksi/joDone/kirim/:id",
  auth,
  ProduksiJoDoneController.KirimProduksiJoDone
);
module.exports = router;
