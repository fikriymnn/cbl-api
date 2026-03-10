const router = require("express").Router();
const masterDivisiController = require("../../../controller/masterData/hr/masterDivisiController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/hr/divisi/:id?", masterDivisiController.getMasterDivisi);
router.post("/master/hr/divisi", masterDivisiController.createMasterDivisi);
router.put(
  "/master/hr/divisi/:id",
  auth,
  masterDivisiController.updateMasterDivisi,
);
router.delete(
  "/master/hr/divisi/:id",
  auth,
  masterDivisiController.nonactiveMasterDivisi,
);

module.exports = router;
