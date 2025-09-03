const router = require("express").Router();
const KalkulasiController = require("../../controller/marketing/kalkulasi/kalkulasiController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/marketing/kalkulasi/:id?", auth, KalkulasiController.getKalkulasi);
router.post("/marketing/kalkulasi", auth, KalkulasiController.createKalkulasi);
router.put(
  "/marketing/kalkulasi/:id",
  auth,
  KalkulasiController.updateKalkulasi
);
router.put(
  "/marketing/kalkulasi/submit/:id",
  auth,
  KalkulasiController.submitKalkulasi
);
router.put(
  "/marketing/kalkulasi/approve/:id",
  auth,
  KalkulasiController.approveKalkulasi
);
router.put(
  "/marketing/kalkulasi/reject/:id",
  auth,
  KalkulasiController.rejectKalkulasi
);
router.delete(
  "/marketing/kalkulasi/:id",
  auth,
  KalkulasiController.deleteKalkulasi
);

module.exports = router;
