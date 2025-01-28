const router = require("express").Router();

const jadwalProduksiViewController = require("../../../controller/ppic/jadwalProduksi/jadwalProduksiViewController");

router.get(
  "/ppic/jadwalProduksiView/:id?",
  jadwalProduksiViewController.getJadwalProduksiView
);

router.post(
  "/ppic/jadwalProduksiView",
  jadwalProduksiViewController.createJadwalProduksiView
);

router.put(
  "/ppic/jadwalProduksiView/:id",
  jadwalProduksiViewController.updateJadwalProduksiView
);

module.exports = router;
