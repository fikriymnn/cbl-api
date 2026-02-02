const router = require("express").Router();
const karyawanController = require("../../../controller/hr/karyawan/karyawanController");

//utama
router.get("/hr/karyawan/:id?", karyawanController.getKaryawan);
router.get("/hr/karyawanRekap", karyawanController.getKaryawanRekap);
router.get("/hr/karyawanPresensi", karyawanController.getKaryawanPresensi);
router.post("/hr/karyawan", karyawanController.createKaryawan);
router.put("/hr/karyawan/:id", karyawanController.updateKaryawan);
router.put("/hr/karyawan/cutOff/:id", karyawanController.cutOffKaryawan);
router.put(
  "/hr/karyawan/activeCutOff/:id",
  karyawanController.activedCutOffKaryawan,
);
router.delete("/hr/karyawan/:id", karyawanController.deleteKaryawan);

router.get("/hr/karyawanBulkAkun", karyawanController.bulkAkunKaryawan);

module.exports = router;
