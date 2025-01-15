const router = require("express").Router();
const masterDepartmentController = require("../../../controller/masterData/hr/masterDepartmentController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/hr/department/:id?",
  masterDepartmentController.getMasterDepartment
);
router.post(
  "/master/hr/department",
  masterDepartmentController.createMasterDepartment
);
router.put(
  "/master/hr/department/:id",
  auth,
  masterDepartmentController.updateMasterDepartment
);
router.delete(
  "/master/hr/department/:id",
  auth,
  masterDepartmentController.deleteMasterDepartment
);

module.exports = router;
