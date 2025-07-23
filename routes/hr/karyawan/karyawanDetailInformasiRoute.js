const router = require("express").Router();
const karyawanDetailInformasiController = require("../../../controller/hr/karyawan/karyawanDetailInformasiController");

//utama
router.get(
  "/hr/karyawanDetailInformasi/:id?",
  karyawanDetailInformasiController.getKaryawanDetailInformasi
);
router.post(
  "/hr/karyawanDetailInformasi",
  karyawanDetailInformasiController.createKaryawanDetailInformasi
);
router.put(
  "/hr/karyawanDetailInformasi/:id",
  karyawanDetailInformasiController.updateKaryawanDetailInformasi
);

router.delete(
  "/hr/karyawanDetailInformasi/:id",
  karyawanDetailInformasiController.deleteKaryawanDetailInformasi
);

module.exports = router;
