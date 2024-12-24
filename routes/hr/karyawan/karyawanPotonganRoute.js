const router = require("express").Router();
const karyawanPotonganController = require("../../../controller/hr/karyawan/karyawanPotonganController");

//utama
router.get(
  "/hr/karyawanPotongan/:id?",
  karyawanPotonganController.getKaryawanPotongan
);
router.post(
  "/hr/karyawanPotongan",
  karyawanPotonganController.createKaryawanPotongan
);
router.put(
  "/hr/karyawanPotongan/:id",
  karyawanPotonganController.updateKaryawanPotongan
);

router.delete(
  "/hr/karyawanPotongan/:id",
  karyawanPotonganController.deleteKaryawanPotongan
);

module.exports = router;
