const router = require("express").Router();
const SoController = require("../../controller/marketing/so/soController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/marketing/so/:id?", auth, SoController.getSo);
router.post("/marketing/so", auth, SoController.createSo);
router.put("/marketing/so/:id", auth, SoController.updateSo);
router.put("/marketing/so/request/:id", auth, SoController.submitRequestSo);
router.put("/marketing/so/approve/:id", auth, SoController.approveSo);
router.put("/marketing/so/reject/:id", auth, SoController.rejectSo);
router.delete("/marketing/so/:id", auth, SoController.deleteSo);

module.exports = router;
