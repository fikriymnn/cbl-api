const router = require("express").Router();
const { auth } = require("../../middlewares/authMiddlewares");
const InformasiKurangQtyController = require("../../controller/informasiKurangQty/informasiKurangQtyController");

router.get(
  "/informasiKurangQty/:id?",
  auth,
  InformasiKurangQtyController.getInformasiKurangQty,
);
router.post(
  "/informasiKurangQty",
  auth,
  InformasiKurangQtyController.createInformasiKurangQty,
);
router.put(
  "/informasiKurangQty/:id",
  auth,
  InformasiKurangQtyController.updateInformasiKurangQty,
);
router.delete(
  "/informasiKurangQty/:id",
  auth,
  InformasiKurangQtyController.deleteInformasiKurangQty,
);

module.exports = router;
