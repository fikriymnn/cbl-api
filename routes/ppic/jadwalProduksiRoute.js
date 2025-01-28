const router = require("express").Router();

const jadwalProduksiController = require("../../controller/ppic/jadwalProduksiController");

router.get(
  "/ppic/jadwalProduksi/:id?",
  jadwalProduksiController.getTiketJadwalProduksi
);

router.get(
  "/ppic/calculateJadwalProduksi/:id",
  jadwalProduksiController.calculateTiketJadwalProduksi
);

router.get(
  "/ppic/calculateJadwalProduksiDua/:id",
  jadwalProduksiController.calculateTiketJadwalProduksiDua
);

module.exports = router;
