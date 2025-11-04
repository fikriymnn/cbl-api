const router = require("express").Router();
const ProduksiLkhTahapanController = require("../../controller/produksi/produksiLkhTahapanController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/produksi/lkhTahapan",
  auth,
  ProduksiLkhTahapanController.getProduksiLkhTahapan
);

module.exports = router;
