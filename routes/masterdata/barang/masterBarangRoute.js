const router = require("express").Router();
const MasterBarangController = require("../../../controller/masterData/barang/masterBarangController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/barang/:id?", auth, MasterBarangController.getMasterBarang);
router.post("/master/barang", auth, MasterBarangController.createMasterBarang);
router.put(
  "/master/barang/:id",
  auth,
  MasterBarangController.updateMasterBarang
);
router.delete(
  "/master/barang/:id",
  auth,
  MasterBarangController.deleteMasterBarang
);

module.exports = router;
