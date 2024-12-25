const router = require("express").Router();
const masterPayrollController = require("../../../controller/masterData/hr/masterPayrollController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/hr/payroll/:id?", masterPayrollController.getMasterPayroll);
router.put(
  "/master/hr/payroll",
  auth,
  masterPayrollController.updateMasterPayroll
);

module.exports = router;
