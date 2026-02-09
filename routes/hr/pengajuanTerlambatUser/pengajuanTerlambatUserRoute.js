const router = require("express").Router();
const pengajuanTerlambatUserController = require("../../../controller/hr/pengajuanTerlambatuser/pengajuanTerlambatUserController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanTerlambatUser/:id?",
  auth,
  pengajuanTerlambatUserController.getPengajuanTerlambatUser,
);
router.post(
  "/hr/pengajuanTerlambatUser",
  auth,
  pengajuanTerlambatUserController.createPengajuanTerlambatUser,
);
router.put(
  "/hr/pengajuanTerlambatUser/approve/:id",
  auth,
  pengajuanTerlambatUserController.approvePengajuanTerlambatUser,
);
router.put(
  "/hr/pengajuanTerlambatUser/reject/:id",
  auth,
  pengajuanTerlambatUserController.rejectPengajuanTerlambatUser,
);

module.exports = router;
