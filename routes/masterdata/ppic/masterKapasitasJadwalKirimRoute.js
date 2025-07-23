const router = require("express").Router();
const masterKapasitasJadwalKirimController = require("../../../controller/masterData/ppic/masterKapasitasJadwalkirimController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/ppic/kapasitasJadwalKirim/:id?",
  masterKapasitasJadwalKirimController.getKapasitasJadwalKirim
);
router.post(
  "/master/ppic/kapasitasJadwalKirim",
  auth,
  masterKapasitasJadwalKirimController.createKapasitasJadwalKirim
);
router.put(
  "/master/ppic/kapasitasJadwalKirim/:id",
  auth,
  masterKapasitasJadwalKirimController.updateKapasitasJadwalKirim
);
router.delete(
  "/master/ppic/kapasitasJadwalKirim/:id",
  auth,
  masterKapasitasJadwalKirimController.deleteKapasitasJadwalKirim
);

module.exports = router;
