const router = require("express").Router();
const pengajuanSPController = require("../../../controller/hr/pengajuanSP/pengajuanSPController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/hr/pengajuanSP/:id?", pengajuanSPController.getPengajuanSP);
router.post("/hr/pengajuanSP", pengajuanSPController.createPengajuanSP);
router.put(
  "/hr/pengajuanSP/approve/:id",
  auth,
  pengajuanSPController.approvePengajuanSP
);
router.put(
  "/hr/pengajuanSP/reject/:id",
  auth,
  pengajuanSPController.rejectPengajuanSP
);

module.exports = router;
