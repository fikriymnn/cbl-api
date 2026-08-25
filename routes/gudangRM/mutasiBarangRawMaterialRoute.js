const router = require("express").Router();
const MutasiBarangRawMaterialController = require("../../controller/gudangRM/mutasiBarangRawMaterial/mutasiBarangRawMasterialController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/rm/mutasiBarang/:id?",
  auth,
  MutasiBarangRawMaterialController.getMutasiBarangRawMaterial,
);

router.get(
  "/rm/mutasiBarangByItem",
  auth,
  MutasiBarangRawMaterialController.getMutasiBarangRawMaterialByItem,
);

module.exports = router;
