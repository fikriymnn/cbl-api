const router = require("express").Router();
const pengajuanMangkirController = require("../../../controller/hr/pengajuanMangkir/pengajuanMangkirController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanMangkir/:id?",
  pengajuanMangkirController.getPengajuanMangkir
);
router.post(
  "/hr/pengajuanMangkir",
  pengajuanMangkirController.createPengajuanMangkir
);
router.put(
  "/hr/pengajuanMangkir/approve/:id",
  auth,
  pengajuanMangkirController.approvePengajuanMangkir
);
router.put(
  "/hr/pengajuanMangkir/reject/:id",
  auth,
  pengajuanMangkirController.rejectPengajuanMangkir
);

module.exports = router;
