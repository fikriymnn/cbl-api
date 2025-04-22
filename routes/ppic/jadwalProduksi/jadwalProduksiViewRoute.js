const router = require("express").Router();

const jadwalProduksiViewController = require("../../../controller/ppic/jadwalProduksi/jadwalProduksiViewController");
const jadwalLemburProduksiViewController = require("../../../controller/ppic/jadwalProduksi/jadwalLemburProduksiController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/ppic/jadwalProduksiView/:id?",
  jadwalProduksiViewController.getJadwalProduksiView
);

router.get(
  "/ppic/jadwalProduksiWeekView/:id?",
  jadwalProduksiViewController.getJadwalProduksiWeeklyView
);

router.post(
  "/ppic/jadwalProduksiView",
  jadwalProduksiViewController.createJadwalProduksiView
);

router.put(
  "/ppic/jadwalProduksiView/:id",
  jadwalProduksiViewController.updateJadwalProduksiView
);

router.put(
  "/ppic/jadwalProduksiView/lembur/:id",
  jadwalProduksiViewController.changeLemburJadwalProduksiView
);
router.put(
  "/ppic/jadwalProduksiView/lemburMonly/:id",
  jadwalProduksiViewController.changeLemburMonlyJadwalProduksiView
);

//jadwal produksi
router.post(
  "/ppic/jadwalProduksiViewLembur",
  auth,
  jadwalLemburProduksiViewController.createLemburMonlyJadwalProduksiView
);
router.get(
  "/ppic/jadwalProduksiViewLembur",
  jadwalLemburProduksiViewController.getJadwalLemburProduksiWeeklyView
);

module.exports = router;
