const router = require("express").Router();
const MasterProdukController = require("../../../controller/masterData/marketing/masterProdukController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/marketing/produk/:id?",
  auth,
  MasterProdukController.getMasterProduk
);
router.post(
  "/master/marketing/produk",
  auth,
  MasterProdukController.createMasterProduk
);
router.put(
  "/master/marketing/produk/:id",
  auth,
  MasterProdukController.updateMasterProduk
);
router.delete(
  "/master/marketing/produk/:id",
  auth,
  MasterProdukController.deleteMasterProduk
);

module.exports = router;
