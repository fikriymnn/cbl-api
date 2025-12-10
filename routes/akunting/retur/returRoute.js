const router = require("express").Router();
const ReturController = require("../../../controller/akunting/retur/returController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/retur/:id?", auth, ReturController.getRetur);
router.get("/returNomor", auth, ReturController.getNoRetur);
router.post("/retur", auth, ReturController.createRetur);
router.put("/retur/:id", auth, ReturController.updateRetur);
// router.put("/retur/request/:id", auth, ReturController.requestretur);
// router.put("/retur/approve/:id", auth, ReturController.approveretur);
// router.put("/retur/reject/:id", auth, ReturController.rejectretur);
router.delete("/retur/:id", auth, ReturController.deleteInvoice);

module.exports = router;
