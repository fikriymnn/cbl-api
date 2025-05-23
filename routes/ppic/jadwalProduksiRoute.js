const router = require("express").Router();

const jadwalProduksiController = require("../../controller/ppic/jadwalProduksiController");

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
  "/ppic/jadwalProduksi/submit/:id",
  jadwalProduksiController.submitTiketJadwalProduksi
);

router.get(
  "/ppic/calculateJadwalProduksi/:id",
  jadwalProduksiController.calculateTiketJadwalProduksi
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
