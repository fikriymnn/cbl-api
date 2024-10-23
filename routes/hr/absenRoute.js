const router = require("express").Router();
const absenController = require("../../controller/hr/absensiController");

router.get("/hr/absensi", absenController.getAbsensi);

module.exports = router;
