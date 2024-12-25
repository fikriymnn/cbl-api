const router = require("express").Router();
const masterShiftController = require("../../../../controller/masterData/hr/masterShift/masterShiftController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get("/master/shift/:id?", masterShiftController.getMasterShift);
router.put("/master/shift/:id", auth, masterShiftController.updateMasterShift);

module.exports = router;
