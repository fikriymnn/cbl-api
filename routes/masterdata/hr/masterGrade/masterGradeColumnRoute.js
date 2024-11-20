const router = require("express").Router();
const masterGradeColumnHrHrController = require("../../../../controller/masterData/hr/masterGrade/mastergradeColumnControler");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/hr/gradeColumn/:id?",
  masterGradeColumnHrHrController.getMasterGradeColumnHr
);
router.post(
  "/master/hr/gradeColumn",
  masterGradeColumnHrHrController.createMasterGradeColumnHr
);
router.put(
  "/master/hr/gradeColumn/:id",
  auth,
  masterGradeColumnHrHrController.updateMasterGradeColumnHr
);
router.delete(
  "/master/hr/gradeColumn/:id",
  auth,
  masterGradeColumnHrHrController.deleteMasterGradeColumnHr
);

module.exports = router;
