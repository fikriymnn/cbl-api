const router = require("express").Router();
const payrollBayarMingguanController = require("../../../controller/hr/payroll/payrollBayarMingguanController");
const payrollBayarMingguanPeriodeController = require("../../../controller/hr/payroll/payrollBayarMingguanPeriodeController");
const payrollBayarBulananController = require("../../../controller/hr/payroll/payrollBayarBulananController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/payroll/bayarMingguan",
  payrollBayarMingguanController.getPayrollBayarMingguan
);

router.post(
  "/hr/payroll/bayarMingguan",
  auth,
  payrollBayarMingguanController.createPayrollBayarMingguan
);

router.get(
  "/hr/payroll/bayarMingguanPeriode",
  payrollBayarMingguanPeriodeController.getPayrollBayarMingguanPeriode
);

router.post(
  "/hr/payroll/bayarMingguanPeriode",
  auth,
  payrollBayarMingguanPeriodeController.createPayrollBayarMingguanPeriode
);

router.get(
  "/hr/payroll/bayarBulanan",
  payrollBayarBulananController.getPayrollBayarBulanan
);

router.post(
  "/hr/payroll/bayarBulanan",
  auth,
  payrollBayarBulananController.createPayrollBayarBulanan
);
//router.get("/hr/payrollBulanan", payrollController.getPayrollBulanan);

module.exports = router;
