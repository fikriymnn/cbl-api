const router = require("express").Router();
const ProduksiLkhTahapanController = require("../../controller/produksi/produksiLkhTahapanController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/produksi/lkhTahapan",
  auth,
  ProduksiLkhTahapanController.getProduksiLkhTahapan
);

router.put(
  "/produksi/lkhTahapan/finish/:id",
  auth,
  ProduksiLkhTahapanController.finishProduksiLkhTahapan
);

router.put(
  "/produksi/lkhTahapan/approve/:id",
  auth,
  ProduksiLkhTahapanController.approveProduksiLkhTahapan
);

module.exports = router;
