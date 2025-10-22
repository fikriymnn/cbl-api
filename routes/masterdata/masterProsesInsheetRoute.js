const router = require("express").Router();
const masterProsesInsheetController = require("../../controller/masterData/masterProsesInsheetController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/master/prosesInsheet/:id?",
  masterProsesInsheetController.getMasterProsesInsheet
);
router.post(
  "/master/prosesInsheet",
  auth,
  masterProsesInsheetController.createMasterProsesInsheet
);
router.put(
  "/master/prosesInsheet/:id",
  auth,
  masterProsesInsheetController.updateMasterProsesInsheet
);
router.delete(
  "/master/prosesInsheet/:id",
  auth,
  masterProsesInsheetController.deleteMasterProsesInsheet
);

module.exports = router;
