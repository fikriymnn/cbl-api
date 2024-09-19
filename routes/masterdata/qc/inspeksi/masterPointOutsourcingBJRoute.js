const router = require("express").Router();
const pointOutsourcingBJController = require("../../../../controller/masterData/qc/inspeksi/masterPointOutsourcingBJController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/pointOutsourcingBJ/:id?",
  pointOutsourcingBJController.getMasterPointOutsourcingBJ
);
router.post(
  "/master/qc/cs/pointOutsourcingBJ",
  auth,
  pointOutsourcingBJController.createMasterPointOutsourcingBJ
);
router.put(
  "/master/qc/cs/pointOutsourcingBJ/:id",
  auth,
  pointOutsourcingBJController.updateMasterPointOutsourcingBJ
);
router.delete(
  "/master/qc/cs/pointOutsourcingBJ/:id",
  auth,
  pointOutsourcingBJController.deleteMasterPointOutsourcingBJ
);

module.exports = router;
