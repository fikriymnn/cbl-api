const router = require("express").Router();

const jadwalProduksiController = require("../../../controller/ppic/jadwalProduksiTiket/tiketPerubahanTanggalKirimController");

router.get(
  "/ppic/perubahanTglKirim/:id?",
  jadwalProduksiController.getTiketJadwalPerubahanTanggalKirim
);
router.post(
  "/ppic/perubahanTglKirim",
  jadwalProduksiController.createTiketJadwalPerubahanTanggalKirim
);
router.put(
  "/ppic/perubahanTglKirim/approve/:id",
  jadwalProduksiController.approveTiketJadwalPerubahanTanggalKirim
);
router.put(
  "/ppic/perubahanTglKirim/reject/:id",
  jadwalProduksiController.rejectTiketJadwalPerubahanTanggalKirim
);

module.exports = router;
