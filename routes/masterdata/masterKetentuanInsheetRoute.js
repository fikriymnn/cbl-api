const router = require("express").Router();
const masterKetentuanInsheetController = require("../../controller/masterData/masterKetentuanInsheetController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/master/ketentuanInsheet/:id?",
  masterKetentuanInsheetController.getMasterKetentuanInsheet
);
router.post(
  "/master/ketentuanInsheet",
  auth,
  masterKetentuanInsheetController.createMasterKetentuanInsheet
);
router.put(
  "/master/ketentuanInsheet/:id",
  auth,
  masterKetentuanInsheetController.updateMasterKetentuanInsheet
);
router.delete(
  "/master/ketentuanInsheet/:id",
  auth,
  masterKetentuanInsheetController.deleteMasterKetentuanInsheet
);

module.exports = router;
