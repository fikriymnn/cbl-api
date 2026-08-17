const router = require("express").Router();
const { auth } = require("../../../middlewares/authMiddlewares");
const EstimasiKurangQtyController = require("../../../controller/qc/estimasiKurangQty/estimasiKurangQtyController");

router.get(
  "/qc/estimasiKurangQty/:id?",
  auth,
  EstimasiKurangQtyController.getEstimasiKurangQty,
);
router.post(
  "/qc/estimasiKurangQty",
  auth,
  EstimasiKurangQtyController.createEstimasiKurangQty,
);
router.put(
  "/qc/estimasiKurangQty:id",
  auth,
  EstimasiKurangQtyController.updateEstimasiKurangQty,
);
router.delete(
  "/qc/estimasiKurangQty/:id",
  auth,
  EstimasiKurangQtyController.approveEstimasiKurangQty,
);

router.put(
  "/qc/estimasiKurangQty/approve/:id",
  auth,
  EstimasiKurangQtyController.approveEstimasiKurangQty,
);

module.exports = router;
