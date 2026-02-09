const router = require("express").Router();
const masterTerlambatController = require("../../../controller/masterData/hr/masterTerlambatController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/hr/terlambat/:id?",
  masterTerlambatController.getMasterTerlambat,
);
router.post(
  "/master/hr/terlambat",
  masterTerlambatController.createMasterTerlambat,
);
router.put(
  "/master/hr/terlambat/:id",
  auth,
  masterTerlambatController.updateMasterTerlambat,
);
router.delete(
  "/master/hr/terlambat/:id",
  auth,
  masterTerlambatController.deleteMasterTerlambat,
);

module.exports = router;
