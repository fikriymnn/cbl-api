const router = require("express").Router();
const pengajuanCutiController = require("../../../controller/hr/pengajuanCuti/pengajuanCutiController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/hr/pengajuanCuti/:id?", pengajuanCutiController.getPengajuanCuti);
router.post("/hr/pengajuanCuti", pengajuanCutiController.createPengajuanCuti);
router.put(
  "/hr/pengajuanCuti/approve/:id",
  auth,
  pengajuanCutiController.approvePengajuanCuti
);
router.put(
  "/hr/pengajuanCuti/reject/:id",
  auth,
  pengajuanCutiController.rejectPengajuanCuti
);

module.exports = router;
