const router = require("express").Router();

const jadwalProduksiController = require("../../../controller/ppic/jadwalProduksiTiket/jadwalProduksiController");
const { auth } = require("../../../middlewares/authMiddlewares");

// ---- ubah hasil calculate (lihat docs/frontend-edit-jadwal-produksi.md) ----
// :id_tahapan = tiket_jadwal_produksi_tahapan.id
router.get(
  "/ppic/jadwalProduksi/availability/:id_tahapan",
  auth,
  jadwalProduksiController.availabilityJadwalProduksi
);
router.post(
  "/ppic/jadwalProduksi/simulate/:id_tahapan",
  auth,
  jadwalProduksiController.simulateJadwalProduksi
);
router.post(
  "/ppic/jadwalProduksi/suggestSlot/:id_tahapan",
  auth,
  jadwalProduksiController.suggestSlotJadwalProduksi
);
router.put(
  "/ppic/jadwalProduksi/apply/:id_tahapan",
  auth,
  jadwalProduksiController.applyJadwalProduksi
);
// :id = tiket_jadwal_produksi.id
router.get(
  "/ppic/jadwalProduksi/conflicts/:id",
  auth,
  jadwalProduksiController.getConflictsJadwalProduksi
);
router.post(
  "/ppic/jadwalProduksi/resolveConflicts/:id",
  auth,
  jadwalProduksiController.resolveConflictsPreviewJadwalProduksi
);
router.put(
  "/ppic/jadwalProduksi/resolveConflicts/:id",
  auth,
  jadwalProduksiController.resolveConflictsApplyJadwalProduksi
);
router.get(
  "/ppic/jadwalProduksi/adjustLog/:id",
  auth,
  jadwalProduksiController.getAdjustLogJadwalProduksi
);

router.get(
  "/ppic/jadwalProduksi/:id?",
  jadwalProduksiController.getTiketJadwalProduksi
);
router.post(
  "/ppic/jadwalProduksi",
  jadwalProduksiController.createTiketJadwalProduksi
);
router.put(
  "/ppic/jadwalProduksi/:id",
  jadwalProduksiController.updateTiketJadwalProduksi
);
router.put(
  "/ppic/jadwalProduksi/editTglKirim/:id",
  jadwalProduksiController.updateTanggalKirimTiketJadwalProduksi
);
router.put(
  "/ppic/jadwalProduksi/submit/:id",
  jadwalProduksiController.submitTiketJadwalProduksi
);

router.get(
  "/ppic/calculateJadwalProduksi/:id",
  jadwalProduksiController.calculateTiketJadwalProduksi
);

router.get(
  "/ppic/checkExpiredDateBooking",
  jadwalProduksiController.checkExpiredDateBooking
);

router.delete(
  "/ppic/jadwalProduksi/cancel/:id",
  jadwalProduksiController.cancelJadwalProduksi
);

// router.put(
//   "/ppic/jadwalProduksi/simpan/:id",
//   jadwalProduksiController.simapanCalculateTiketJadwalProduksi
// );

// router.get(
//   "/ppic/calculateJadwalProduksiDua/:id",
//   jadwalProduksiController.calculateTiketJadwalProduksiDua
// );

module.exports = router;
