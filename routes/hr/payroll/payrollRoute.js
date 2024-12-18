const router = require("express").Router();
const payrollController = require("../../../controller/hr/payroll/payrollController");

router.get("/hr/payroll", payrollController.getPayroll);
router.get("/hr/payrollBulanan", payrollController.getPayrollBulanan);

module.exports = router;
