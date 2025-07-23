const router = require("express").Router();
const karyawanRiwayatPendidikanController = require("../../../controller/hr/karyawan/karyawanRiwayatPendidikanController");

//utama
router.get(
  "/hr/karyawanRiwayatPendidikan/:id?",
  karyawanRiwayatPendidikanController.getKaryawanRiwayatPendidikan
);
router.post(
  "/hr/karyawanRiwayatPendidikan",
  karyawanRiwayatPendidikanController.createKaryawanRiwayatPendidikan
);
router.put(
  "/hr/karyawanRiwayatPendidikan/:id",
  karyawanRiwayatPendidikanController.updateKaryawanRiwayatPendidikan
);

router.delete(
  "/hr/karyawanRiwayatPendidikan/:id",
  karyawanRiwayatPendidikanController.deleteKaryawanRiwayatPendidikan
);

module.exports = router;
