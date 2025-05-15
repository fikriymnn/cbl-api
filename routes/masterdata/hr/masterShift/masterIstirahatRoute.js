const router = require("express").Router();
const masterIstirahatController = require("../../../../controller/masterData/hr/masterShift/masterIstirahatController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/shift/istirahat/:id?",
  masterIstirahatController.getMasteristirahat
);
router.post(
  "/master/shift/istirahat",
  auth,
  masterIstirahatController.createMasteristirahat
);
router.put(
  "/master/shift/istirahat",
  auth,
  masterIstirahatController.updateMasteristirahat
);
router.delete(
  "/master/shift/istirahat/:id",

  masterIstirahatController.deleteMasteristirahat
);

module.exports = router;
