const router = require("express").Router();
const MasterKategoriKendalaController = require("../../../controller/masterData/kodeProduksi/masterKategoriKendalaController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/produksi/kategoriKendala/:id?",
  auth,
  MasterKategoriKendalaController.getMasterKategoriKendala
);
router.post(
  "/master/produksi/kategoriKendala",
  auth,
  MasterKategoriKendalaController.createMasterKategoriKendala
);
router.put(
  "/master/produksi/kategoriKendala/:id",
  auth,
  MasterKategoriKendalaController.updateMasterKategoriKendala
);
router.delete(
  "/master/produksi/kategoriKendala/:id",
  auth,
  MasterKategoriKendalaController.deleteMasterKategoriKendala
);

module.exports = router;
