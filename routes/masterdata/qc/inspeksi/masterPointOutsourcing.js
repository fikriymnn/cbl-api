const router = require("express").Router();
const pointOutsourcingController = require("../../../../controller/masterData/qc/inspeksi/masterPointOutsourcingController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/cs/pointOutsourcing/:id?",
  pointOutsourcingController.getMasterPointOutsourcing);
router.post(
  "/master/qc/cs/pointOutsourcing",
  auth,
  pointOutsourcingController.createMasterPointOutsourcing
);
router.put(
  "/master/qc/cs/pointOutsourcing/:id",
  auth,
  pointOutsourcingController.updateMasterPointOutsourcing
);
router.delete(
  "/master/qc/cs/pointOutsourcing/:id",
  auth,
  pointOutsourcingController.deleteMasterPointOutsourcing
);

module.exports = router;