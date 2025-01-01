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

module.exports = router;
