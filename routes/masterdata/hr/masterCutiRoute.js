const router = require("express").Router();
const masterCutiController = require("../../../controller/masterData/hr/masterCutiController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/cuti/:id?", masterCutiController.getMasterCuti);
router.post("/master/cuti", masterCutiController.createMasterCuti);
router.put("/master/cuti/:id", auth, masterCutiController.updateMasterCuti);

module.exports = router;
