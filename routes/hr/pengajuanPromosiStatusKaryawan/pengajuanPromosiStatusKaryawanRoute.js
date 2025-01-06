const router = require("express").Router();
const pengajuanPromosiStatusKaryawanController = require("../../../controller/hr/pengajuanPromosiStatusKaryawan/pengajuanPromosiStatusKaryawanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanPromosiStatusKaryawan/:id?",
  pengajuanPromosiStatusKaryawanController.getPengajuanStatusKaryawan
);
router.post(
  "/hr/pengajuanPromosiStatusKaryawan",
  pengajuanPromosiStatusKaryawanController.createPengajuanStatusKaryawan
);
router.put(
  "/hr/pengajuanPromosiStatusKaryawan/approve/:id",
  auth,
  pengajuanPromosiStatusKaryawanController.approvePengajuanStatusKaryawan
);
router.put(
  "/hr/pengajuanPromosiStatusKaryawan/reject/:id",
  auth,
  pengajuanPromosiStatusKaryawanController.rejectPengajuanStatusKaryawan
);

module.exports = router;
