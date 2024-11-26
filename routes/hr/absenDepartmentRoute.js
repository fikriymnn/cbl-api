const router = require("express").Router();
const absenDepartmentController = require("../../controller/hr/absensiDepartmentController");

router.get(
  "/hr/absensiDepartment",
  absenDepartmentController.getAbsensiDepartment
);

module.exports = router;
