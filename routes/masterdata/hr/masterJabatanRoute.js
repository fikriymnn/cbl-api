const router = require("express").Router();
const masterJabatanController = require("../../../controller/masterData/hr/masterJabatanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/hr/Jabatan/:id?", masterJabatanController.getMasterJabatan);
router.post("/master/hr/Jabatan", masterJabatanController.createMasterJabatan);
router.put(
  "/master/hr/Jabatan/:id",
  auth,
  masterJabatanController.updateMasterJabatan
);

module.exports = router;
