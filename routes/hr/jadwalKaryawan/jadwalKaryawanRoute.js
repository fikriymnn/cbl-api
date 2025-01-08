const router = require("express").Router();
const jadwalKaryawanController = require("../../../controller/hr/jadwalKaryawan/jadwalKaryawanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/jadwalKaryawan/:id?",
  jadwalKaryawanController.getJadwalKaryawan
);

router.post(
  "/hr/jadwalKaryawan",
  jadwalKaryawanController.createJadwalKaryawan
);

router.post(
  "/hr/jadwalKaryawanSatuTahun",
  jadwalKaryawanController.createJadwalKaryawanSatuTahun
);

router.put(
  "/hr/jadwalKaryawan/:id",
  jadwalKaryawanController.updateJadwalKaryawan
);
router.delete(
  "/hr/jadwalKaryawan/:id",
  jadwalKaryawanController.deleteJadwalKaryawan
);

module.exports = router;
