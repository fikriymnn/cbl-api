const router = require("express").Router();
const masterAbsensiController = require("../../../controller/masterData/hr/masterAbsensiController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/hr/absensi", masterAbsensiController.getMasterAbsensi);
router.put(
  "/master/hr/absensi",
  auth,
  masterAbsensiController.updateMasterAbsensi
);

module.exports = router;
