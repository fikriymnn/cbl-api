const router = require("express").Router();
const masterJenisWarnaTinta = require("../../controller/masterData/masterJenisWarnaTintaController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/master/jenisWarnaTinta/:id?",
  masterJenisWarnaTinta.getMasterJenisWarnaTinta
);
router.post(
  "/master/jenisWarnaTinta",
  auth,
  masterJenisWarnaTinta.createMasterJenisWarnaTinta
);
router.put(
  "/master/jenisWarnaTinta/:id",
  auth,
  masterJenisWarnaTinta.updateMasterJenisWarnaTinta
);
router.delete(
  "/master/jenisWarnaTinta/:id",
  auth,
  masterJenisWarnaTinta.deleteMasterJenisWarnaTinta
);

module.exports = router;
