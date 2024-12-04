const router = require("express").Router();
const pengajuanSakitController = require("../../../controller/hr/pengajuanSakit/pengajuanSakitController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanSakit/:id?",
  pengajuanSakitController.getPengajuanSakit
);
router.post(
  "/hr/pengajuanSakit",
  pengajuanSakitController.createPengajuanSakit
);
router.put(
  "/hr/pengajuanSakit/approve/:id",
  auth,
  pengajuanSakitController.approvePengajuanSakit
);
router.put(
  "/hr/pengajuanSakit/reject/:id",
  auth,
  pengajuanSakitController.rejectPengajuanSakit
);

module.exports = router;
