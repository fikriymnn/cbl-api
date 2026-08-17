const router = require("express").Router();
const { auth } = require("../../middlewares/authMiddlewares");
const EstimasiKurangQtyController = require("../../controller/produksi/estimasiKurangQtyController");

router.get(
  "/produksi/estimasiKurangQty/:id?",
  auth,
  EstimasiKurangQtyController.getEstimasiKurangQty,
);
router.post(
  "/produksi/estimasiKurangQty",
  auth,
  EstimasiKurangQtyController.createEstimasiKurangQty,
);
router.put(
  "/produksi/estimasiKurangQty:id",
  auth,
  EstimasiKurangQtyController.updateEstimasiKurangQty,
);
router.delete(
  "/produksi/estimasiKurangQty/:id",
  auth,
  EstimasiKurangQtyController.approveEstimasiKurangQty,
);

router.put(
  "/produksi/estimasiKurangQty/approve/:id",
  auth,
  EstimasiKurangQtyController.approveEstimasiKurangQty,
);

module.exports = router;
