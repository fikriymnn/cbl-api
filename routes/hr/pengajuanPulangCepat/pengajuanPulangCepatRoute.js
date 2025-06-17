const router = require("express").Router();
const pengajuanPulangCepatController = require("../../../controller/hr/pengajuanPulangCepat/pengajuanPulangCepatController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanPulangCepat/:id?",
  pengajuanPulangCepatController.getPengajuanPulangCepat
);
router.post(
  "/hr/pengajuanPulangCepat",
  pengajuanPulangCepatController.createPengajuanPulangCepat
);
router.put(
  "/hr/pengajuanPulangCepat/approve/:id",
  auth,
  pengajuanPulangCepatController.approvePengajuanPulangCepat
);

router.put(
  "/hr/pengajuanPulangCepat/reject/:id",
  auth,
  pengajuanPulangCepatController.rejectPengajuanPulangCepat
);

module.exports = router;
