const router = require("express").Router();
const pengajuanKaryawanController = require("../../../controller/hr/pengajuanKaryawan/pengajuanKaryawanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanKaryawan/:id?",
  pengajuanKaryawanController.getPengajuanKaryawan
);
router.post(
  "/hr/pengajuanKaryawan",
  pengajuanKaryawanController.createPengajuanKaryawan
);
router.put(
  "/hr/pengajuanKaryawan/approve/:id",
  auth,
  pengajuanKaryawanController.approvePengajuanKaryawan
);
router.put(
  "/hr/pengajuanKaryawan/reject/:id",
  auth,
  pengajuanKaryawanController.rejectPengajuanKaryawan
);

module.exports = router;
