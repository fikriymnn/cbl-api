const router = require("express").Router();
const departmentController = require("../../../../controller/masterData/qc/department/masterDepartmentController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get(
  "/master/qc/department/:id?",
  departmentController.getMasterDepartment
);
router.post(
  "/master/qc/department",
  auth,
  departmentController.createMasterDepartment
);
router.put(
  "/master/qc/department/:id",
  auth,
  departmentController.updateMasterDepartment
);
router.delete(
  "/master/qc/department/:id",
  auth,
  departmentController.deleteMasterDepartment
);

module.exports = router;
