const router = require("express").Router();
const masterSPController = require("../../../controller/masterData/hr/masterSPController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/SP/:id?", masterSPController.getMasterSP);
router.post("/master/SP", masterSPController.createMasterSP);
router.put("/master/SP/:id", auth, masterSPController.updateMasterSP);

module.exports = router;
