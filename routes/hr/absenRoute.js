const router = require("express").Router();
const absenController = require("../../controller/hr/absensiController");

router.get("/hr/absensi", absenController.getAbsensi);
router.get("/hr/absensiRekap", absenController.getAbsensiRekap);

module.exports = router;
