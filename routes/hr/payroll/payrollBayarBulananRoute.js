const router = require("express").Router();
const payrollBayarBulananController = require("../../../controller/hr/payroll/payrollBayarBulananController");
const payrollBayarBulananPeriodeController = require("../../../controller/hr/payroll/payrollBayarBulananPeriodeController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/payroll/bayarBulanan",
  payrollBayarBulananController.getPayrollBayarBulanan
);

router.post(
  "/hr/payroll/bayarBulanan",
  auth,
  payrollBayarBulananController.createPayrollBayarBulanan
);

router.get(
  "/hr/payroll/bayarBulananPeriode",
  payrollBayarBulananPeriodeController.getPayrollBayarBulananPeriode
);

router.post(
  "/hr/payroll/bayarBulananPeriode",
  auth,
  payrollBayarBulananPeriodeController.createPayrollBayarBulananPeriode
);
router.put(
  "/hr/payroll/bayarBulananPeriode/approve/:id",
  auth,
  payrollBayarBulananPeriodeController.approvePayrollBayarBulananPeriode
);

router.put(
  "/hr/payroll/bayarBulananPeriode/bayar/:id",
  auth,
  payrollBayarBulananPeriodeController.bayarPayrollBayarBulananPeriode
);

//router.get("/hr/payrollBulanan", payrollController.getPayrollBulanan);

module.exports = router;
