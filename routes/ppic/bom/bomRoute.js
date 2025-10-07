const router = require("express").Router();
const BomController = require("../../../controller/ppic/bom/bomController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/ppic/bom/:id?", auth, BomController.getBomModel);
router.post("/ppic/bom", auth, BomController.createBomModel);
router.put("/ppic/bom/:id", auth, BomController.updateBomModel);
router.put("/ppic/bom/request/:id", auth, BomController.submitRequestBom);
router.put("/ppic/bom/approve/:id", auth, BomController.approveBom);
router.put("/ppic/bom/reject/:id", auth, BomController.rejectBom);

module.exports = router;
