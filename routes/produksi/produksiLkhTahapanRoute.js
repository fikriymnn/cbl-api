const router = require("express").Router();
const ProduksiLkhTahapanController = require("../../controller/produksi/produksiLkhTahapanController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/produksi/lkhTahapan/:id?",
  auth,
  ProduksiLkhTahapanController.getProduksiLkhTahapan
);

router.get(
  "/produksi/mesinByJo",
  auth,
  ProduksiLkhTahapanController.getMesinByJO
);

// router.put(
//   "/produksi/lkhTahapan/finish/:id",
//   auth,
//   ProduksiLkhTahapanController.finishProduksiLkhTahapan
// );

router.put(
  "/produksi/lkhTahapan/approve/:id",
  auth,
  ProduksiLkhTahapanController.approveProduksiLkhTahapan
);

router.put(
  "/produksi/activedLkhTahapan",
  auth,
  ProduksiLkhTahapanController.activedProduksiLkhTahapan
);

router.put(
  "/produksi/openLkhTahapan/:id",
  auth,
  ProduksiLkhTahapanController.openProduksiLkhTahapan
);

module.exports = router;
