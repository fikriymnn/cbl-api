const router = require("express").Router();
const masterKategoriSettingKapasitasController = require("../../../controller/masterData/ppic/masterKategoriSettingKapasitasController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/ppic/settingKapasitas/:id?",
  masterKategoriSettingKapasitasController.getMasterkategoriSettingKapisitasModel
);
router.post(
  "/master/ppic/settingKapasitas",
  auth,
  masterKategoriSettingKapasitasController.createMasterkategoriSettingKapisitasModel
);
router.put(
  "/master/ppic/settingKapasitas/:id",
  auth,
  masterKategoriSettingKapasitasController.updateMasterkategoriSettingKapisitasModel
);
router.delete(
  "/master/ppic/settingKapasitas/:id",
  auth,
  masterKategoriSettingKapasitasController.deleteMasterkategoriSettingKapisitasModel
);

module.exports = router;
