const router = require("express").Router();
const pengajuanPromosiController = require("../../../controller/hr/pengajuanPromosi/pengajuanPromosiController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanPromosi/:id?",
  pengajuanPromosiController.getPengajuanPromosi
);
router.post(
  "/hr/pengajuanPromosi",
  pengajuanPromosiController.createPengajuanPromosi
);
router.put(
  "/hr/pengajuanPromosi/approve/:id",
  auth,
  pengajuanPromosiController.approvePengajuanPromosi
);
router.put(
  "/hr/pengajuanPromosi/reject/:id",
  auth,
  pengajuanPromosiController.rejectPengajuanPromosi
);

module.exports = router;
