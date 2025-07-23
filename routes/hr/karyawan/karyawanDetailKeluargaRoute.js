const router = require("express").Router();
const karyawanDetailKeluargaController = require("../../../controller/hr/karyawan/karyawanDetailKeluargaController");

//utama
router.get(
  "/hr/karyawanDetailKeluarga/:id?",
  karyawanDetailKeluargaController.getKaryawanDetailKeluarga
);
router.post(
  "/hr/karyawanDetailKeluarga",
  karyawanDetailKeluargaController.createKaryawanDetailKeluarga
);
router.put(
  "/hr/karyawanDetailKeluarga/:id",
  karyawanDetailKeluargaController.updateKaryawanDetailKeluarga
);

router.delete(
  "/hr/karyawanDetailKeluarga/:id",
  karyawanDetailKeluargaController.deleteKaryawanDetailKeluarga
);

module.exports = router;
