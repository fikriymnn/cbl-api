const router = require("express").Router();
const MasterCoaController = require("../../../controller/akunting/masterCoa/masterCoaController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/masterCoaTipeAkun", auth, MasterCoaController.getTipeAkun);
router.get("/masterCoaTree", auth, MasterCoaController.getMasterCoaTree);
router.get("/masterCoaParent", auth, MasterCoaController.getParentCoa);
router.get("/masterCoa/:id?", auth, MasterCoaController.getMasterCoa);
router.post("/masterCoa", auth, MasterCoaController.createMasterCoa);
router.put("/masterCoa/active/:id", auth, MasterCoaController.setActiveMasterCoa);
router.put("/masterCoa/:id", auth, MasterCoaController.updateMasterCoa);
router.delete("/masterCoa/:id", auth, MasterCoaController.deleteMasterCoa);

module.exports = router;
