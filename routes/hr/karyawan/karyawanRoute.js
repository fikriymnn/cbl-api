const router = require("express").Router();
const karyawanController = require("../../../controller/hr/karyawan/karyawanController");

//utama
router.get("/hr/karyawan/:id?", karyawanController.getKaryawan);
router.post("/hr/karyawan", karyawanController.createKaryawan);
router.put("/hr/karyawan/:id", karyawanController.updateKaryawan);
router.put("/hr/karyawan/cutOff/:id", karyawanController.cutOffKaryawan);
router.delete("/hr/karyawan/:id", karyawanController.deleteKaryawan);

module.exports = router;
