const router = require("express").Router();
const payrollBayarBulananController = require("../../../controller/hr/payroll/payrollBayarBulananController");
const payrollBayarBulananPeriodeController = require("../../../controller/hr/payroll/payrollBayarBulananPeriodeController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/payroll/bayarBulanan",
  payrollBayarBulananController.getPayrollBayarBulanan,
);

router.post(
  "/hr/payroll/bayarBulanan",
  auth,
  payrollBayarBulananController.createPayrollBayarBulanan,
);

router.post(
  "/hr/payroll/bayarBulanan/detail",
  auth,
  payrollBayarBulananController.addDetailPayrollBayarBulanan,
);

router.put(
  "/hr/payroll/bayarBulanan/detail/delete",
  auth,
  payrollBayarBulananController.deleteDetailPayrollBayarBulanan,
);

router.get(
  "/hr/payroll/bayarBulananPeriode",
  payrollBayarBulananPeriodeController.getPayrollBayarBulananPeriode,
);

router.get(
  "/hr/payroll/checkBayarBulananPeriode",
  payrollBayarBulananPeriodeController.checkPayrollBayarBulananPeriode,
);
router.put(
  "/hr/payroll/bayarBulananPeriode/submit/:id",
  auth,
  payrollBayarBulananPeriodeController.submitPayrollBayarBulananPeriode,
);
router.post(
  "/hr/payroll/bayarBulananPeriode",
  auth,
  payrollBayarBulananPeriodeController.createPayrollBayarBulananPeriode,
);
router.put(
  "/hr/payroll/bayarBulananPeriode/approve/:id",
  auth,
  payrollBayarBulananPeriodeController.approvePayrollBayarBulananPeriode,
);

router.put(
  "/hr/payroll/bayarBulananPeriode/bayar/:id",
  auth,
  payrollBayarBulananPeriodeController.bayarPayrollBayarBulananPeriode,
);

//router.get("/hr/payrollBulanan", payrollController.getPayrollBulanan);

module.exports = router;
