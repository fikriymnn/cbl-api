const router = require("express").Router();
const pengajuanDinasController = require("../../../controller/hr/pengajuanDinas/pengajuanDinasController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/pengajuanDinas/:id?",
  pengajuanDinasController.getPengajuanDinas
);
router.post(
  "/hr/pengajuanDinas",
  pengajuanDinasController.createPengajuanDinas
);
router.put(
  "/hr/pengajuanDinas/approve/:id",
  auth,
  pengajuanDinasController.approvePengajuanDinas
);
router.put(
  "/hr/pengajuanDinas/reject/:id",
  auth,
  pengajuanDinasController.rejectPengajuanDinas
);

module.exports = router;
