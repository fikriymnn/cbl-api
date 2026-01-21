const router = require("express").Router();
const BomPpicController = require("../../../controller/ppic/bomPpic/bomPpicController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/ppic/bomPpic/:id?", auth, BomPpicController.getBomPpicModel);
router.get(
  "/ppic/bomPpicJumlahData",
  auth,
  BomPpicController.getBomPpicJumlahData
);
router.post("/ppic/bomPpic", auth, BomPpicController.createBomPpicModel);
router.put("/ppic/bomPpic/:id", auth, BomPpicController.updateBomPpicModel);
router.put(
  "/ppic/bomPpic/request/:id",
  auth,
  BomPpicController.submitRequestBomPpic
);
router.put("/ppic/bomPpic/approve/:id", auth, BomPpicController.approveBomPpic);
router.put("/ppic/bomPpic/reject/:id", auth, BomPpicController.rejectBomPpic);
router.put(
  "/ppic/bomPpic/backToBom/:id",
  auth,
  BomPpicController.backToProcessBom
);
module.exports = router;
