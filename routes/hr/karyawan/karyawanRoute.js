const router = require("express").Router();
const karyawanController = require("../../../controller/hr/karyawan/karyawanController");

//utama
router.get("/hr/karyawan/:id?", karyawanController.getKaryawan);
router.post("/hr/karyawan", karyawanController.createKaryawan);
router.put("/hr/karyawan/:id", karyawanController.updateKaryawan);
router.delete("/hr/karyawan/:id", karyawanController.deleteKaryawan);

module.exports = router;
