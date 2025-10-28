const router = require("express").Router();
const MasterKodeProduksiController = require("../../../controller/masterData/kodeProduksi/masterKodeProduksiController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/produksi/kodeProduksi/:id?",
  auth,
  MasterKodeProduksiController.getMasterKodeProduksi
);
router.post(
  "/master/produksi/kodeProduksi",
  auth,
  MasterKodeProduksiController.createMasterKodeProduksi
);
router.put(
  "/master/produksi/kodeProduksi/:id",
  auth,
  MasterKodeProduksiController.updateMasterKodeProduksi
);
router.delete(
  "/master/produksi/kodeProduksi/:id",
  auth,
  MasterKodeProduksiController.deleteMasterKodeProduksi
);

module.exports = router;
