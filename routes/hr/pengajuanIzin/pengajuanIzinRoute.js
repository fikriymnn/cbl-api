const router = require("express").Router();
const pengajuanIzinController = require("../../../controller/hr/pengajuanIzin/pengajuanIzinController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/hr/pengajuanIzin/:id?", pengajuanIzinController.getPengajuanIzin);
router.post("/hr/pengajuanIzin", pengajuanIzinController.createPengajuanIzin);
router.put(
  "/hr/pengajuanIzin/approve/:id",
  auth,
  pengajuanIzinController.approvePengajuanIzin
);
router.put(
  "/hr/pengajuanIzin/reject/:id",
  auth,
  pengajuanIzinController.rejectPengajuanIzin
);

module.exports = router;
