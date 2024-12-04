const router = require("express").Router();
const pengajuanPinjamanController = require("../../../controller/hr/pengajuanPinjaman/pengajuanPinjamanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanPinjaman/:id?",
  pengajuanPinjamanController.getPengajuanPinjaman
);
router.post(
  "/hr/pengajuanPinjaman",
  pengajuanPinjamanController.createPengajuanPinjaman
);
router.put(
  "/hr/pengajuanPinjaman/approve/:id",
  auth,
  pengajuanPinjamanController.approvePengajuanPinjaman
);
router.put(
  "/hr/pengajuanPinjaman/reject/:id",
  auth,
  pengajuanPinjamanController.rejectPengajuanPinjaman
);

module.exports = router;
