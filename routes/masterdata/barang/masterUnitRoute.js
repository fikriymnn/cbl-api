const router = require("express").Router();
const MasterUnitController = require("../../../controller/masterData/barang/masterUnitController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/unit/:id?", auth, MasterUnitController.getMasterUnit);
router.post("/master/unit", auth, MasterUnitController.createMasterUnit);
router.put("/master/unit/:id", auth, MasterUnitController.updateMasterUnit);
router.delete("/master/unit/:id", auth, MasterUnitController.deleteMasterUnit);

module.exports = router;
