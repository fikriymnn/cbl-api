const router = require("express").Router();
const karyawanTambahanController = require("../../../controller/hr/karyawan/karyawanTambahanController");

//utama
router.get(
  "/hr/karyawanTambahan/:id?",
  karyawanTambahanController.getKaryawanTambahan,
);
router.post(
  "/hr/karyawanTambahan",
  karyawanTambahanController.createKaryawanTambahan,
);
router.put(
  "/hr/karyawanTambahan/:id",
  karyawanTambahanController.updateKaryawanTambahan,
);

router.delete(
  "/hr/karyawanTambahan/:id",
  karyawanTambahanController.deleteKaryawanTambahan,
);

module.exports = router;
