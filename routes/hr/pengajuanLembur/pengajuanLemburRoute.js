const router = require("express").Router();
const pengajuanLemburController = require("../../../controller/hr/pengajuanLembur/pengajuanLemburController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanLembur/:id?",
  pengajuanLemburController.getPengajuanLembur
);
router.post(
  "/hr/pengajuanLembur",
  pengajuanLemburController.createPengajuanLembur
);
router.put(
  "/hr/pengajuanLembur/approve/:id",
  auth,
  pengajuanLemburController.approvePengajuanLembur
);
router.put(
  "/hr/pengajuanLembur/reject/:id",
  auth,
  pengajuanLemburController.rejectPengajuanLembur
);

module.exports = router;
