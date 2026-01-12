const router = require("express").Router();
const SoController = require("../../controller/marketing/so/soController");
const SoPerubahanTanggalKirimController = require("../../controller/marketing/so/soPerubahanTanggalKirimController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/marketing/so/:id?", auth, SoController.getSo);
router.get("/marketing/soJumlahData", auth, SoController.getSoJumlahData);
router.post("/marketing/so", auth, SoController.createSo);
router.put("/marketing/so/:id", auth, SoController.updateSo);
router.put(
  "/marketing/so/kelengkapanPo/:id",
  auth,
  SoController.kelengkapanPoSo
);
router.put("/marketing/so/request/:id", auth, SoController.submitRequestSo);
router.put("/marketing/so/approve/:id", auth, SoController.approveSo);
router.put("/marketing/so/reject/:id", auth, SoController.rejectSo);
router.put("/marketing/so/cancel/:id", auth, SoController.cancelSo);
router.put("/marketing/so/doneWork/:id", auth, SoController.doneWorkSo);
router.delete("/marketing/so/:id", auth, SoController.deleteSo);

// request perubahan tanggal kirim
router.get(
  "/marketing/soPerubahanTanggalKirim/:id?",
  auth,
  SoPerubahanTanggalKirimController.getSoPerubahanTglKirim
);
router.post(
  "/marketing/soPerubahanTanggalKirim",
  auth,
  SoPerubahanTanggalKirimController.createSoPerubahanTanggalKirim
);
router.put(
  "/marketing/soPerubahanTanggalKirim/:id",
  auth,
  SoPerubahanTanggalKirimController.updateSoPerubahanTanggalKirim
);
router.put(
  "/marketing/soPerubahanTanggalKirim/approve/:id",
  auth,
  SoPerubahanTanggalKirimController.approveSoPerubahanTanggalKirim
);
router.put(
  "/marketing/soPerubahanTanggalKirim/reject/:id",
  auth,
  SoPerubahanTanggalKirimController.rejectSoPerubahanTanggalKirim
);
router.delete(
  "/marketing/soPerubahanTanggalKirim/:id",
  auth,
  SoPerubahanTanggalKirimController.deleteSoPerubahanTanggalKirim
);

module.exports = router;
