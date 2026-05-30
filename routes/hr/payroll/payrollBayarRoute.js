const router = require("express").Router();
const payrollBayarMingguanController = require("../../../controller/hr/payroll/payrollBayarMingguanController");
const payrollBayarMingguanPeriodeController = require("../../../controller/hr/payroll/payrollBayarMingguanPeriodeController");
const payrollBayarBulananController = require("../../../controller/hr/payroll/payrollBayarBulananController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/hr/payroll/bayarMingguan",
  payrollBayarMingguanController.getPayrollBayarMingguan,
);

router.post(
  "/hr/payroll/bayarMingguan",
  auth,
  payrollBayarMingguanController.createPayrollBayarMingguan,
);

router.put(
  "/hr/payroll/bayarMingguan/detail/delete",
  auth,
  payrollBayarMingguanController.deleteDetailPayrollBayarMingguan,
);

router.post(
  "/hr/payroll/bayarMingguan/detail",
  auth,
  payrollBayarMingguanController.addDetailPayrollBayarMingguan,
);

router.get(
  "/hr/payroll/bayarMingguanPeriode",
  payrollBayarMingguanPeriodeController.getPayrollBayarMingguanPeriode,
);
router.get(
  "/hr/payroll/checkBayarMingguanPeriode",
  payrollBayarMingguanPeriodeController.checkPayrollBayarMingguanPeriode,
);

router.put(
  "/hr/payroll/bayarMingguanPeriode/submit/:id",
  auth,
  payrollBayarMingguanPeriodeController.submitPayrollMingguanPeriode,
);

router.post(
  "/hr/payroll/bayarMingguanPeriode",
  auth,
  payrollBayarMingguanPeriodeController.createPayrollBayarMingguanPeriode,
);
router.put(
  "/hr/payroll/bayarMingguanPeriode/approve/:id",
  auth,
  payrollBayarMingguanPeriodeController.approvePayrollBayarMingguanPeriode,
);
router.put(
  "/hr/payroll/bayarMingguanPeriode/reject/:id",
  auth,
  payrollBayarMingguanPeriodeController.rejectPayrollBayarMingguanPeriode,
);

router.put(
  "/hr/payroll/bayarMingguanPeriode/bayar/:id",
  auth,
  payrollBayarMingguanPeriodeController.bayarPayrollBayarMingguanPeriode,
);
//router.get("/hr/payrollBulanan", payrollController.getPayrollBulanan);

module.exports = router;
