const router = require("express").Router();
const karyawanRiwayatPekerjaanController = require("../../../controller/hr/karyawan/karyawanRiwayatPekerjaanController");

//utama
router.get(
  "/hr/karyawanRiwayatPekerjaan/:id?",
  karyawanRiwayatPekerjaanController.getKaryawanRiwayatPekerjaan
);
router.post(
  "/hr/karyawanRiwayatPekerjaan",
  karyawanRiwayatPekerjaanController.createKaryawanRiwayatPekerjaan
);
router.put(
  "/hr/karyawanRiwayatPekerjaan/:id",
  karyawanRiwayatPekerjaanController.updateKaryawanRiwayatPekerjaan
);

router.delete(
  "/hr/karyawanRiwayatPekerjaan/:id",
  karyawanRiwayatPekerjaanController.deleteKaryawanRiwayatPekerjaan
);

module.exports = router;
