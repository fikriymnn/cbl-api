const router = require("express").Router();
const masterStatusKaryawan = require("../../../controller/masterData/hr/masterStatusKaryawanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/statusKaryawan/:id?",
  masterStatusKaryawan.getMasterStatusKaryawan
);
router.post(
  "/master/statusKaryawan",
  auth,
  masterStatusKaryawan.createMasterKaryawan
);
router.put(
  "/master/statusKaryawan/:id",
  auth,
  masterStatusKaryawan.updateMasterKaryawan
);
router.delete(
  "/master/statusKaryawan/:id",
  auth,
  masterStatusKaryawan.deleteMasterKaryawan
);

module.exports = router;
