const router = require("express").Router();
const { auth } = require("../../../middlewares/authMiddlewares");
const EstimasiKurangQtyController = require("../../../controller/ppic/estimasiKurangQty/estimasiKurangQtyController");

router.get(
  "/ppic/estimasiKurangQty/:id?",
  auth,
  EstimasiKurangQtyController.getEstimasiKurangQty,
);
router.post(
  "/ppic/estimasiKurangQty",
  auth,
  EstimasiKurangQtyController.createEstimasiKurangQty,
);
router.put(
  "/ppic/estimasiKurangQty:id",
  auth,
  EstimasiKurangQtyController.updateEstimasiKurangQty,
);
router.delete(
  "/ppic/estimasiKurangQty/:id",
  auth,
  EstimasiKurangQtyController.approveEstimasiKurangQty,
);

router.put(
  "/ppic/estimasiKurangQty/approve/:id",
  auth,
  EstimasiKurangQtyController.approveEstimasiKurangQty,
);

module.exports = router;
