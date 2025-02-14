const router = require("express").Router();
const pengajuanTerlambatController = require("../../../controller/hr/pengajuanTerlambat/pengajuanTerlambatController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanTerlambat/:id?",
  pengajuanTerlambatController.getPengajuanTerlambat
);
router.post(
  "/hr/pengajuanTerlambat",
  pengajuanTerlambatController.createPengajuanTerlambat
);
router.put(
  "/hr/pengajuanTerlambat/approve/:id",
  auth,
  pengajuanTerlambatController.approvePengajuanTerlambat
);
router.put(
  "/hr/pengajuanTerlambat/reject/:id",
  auth,
  pengajuanTerlambatController.rejectPengajuanTerlambat
);

module.exports = router;
