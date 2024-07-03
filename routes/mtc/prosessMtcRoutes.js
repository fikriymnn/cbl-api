const router = require("express").Router();
const {
  getProsesMtcByTicket,
  getProsesMtcById,
  responseMtc,
  analisisMtc,
  deleteProses,
  pendingProses,
  requestedDate,
  approveDate,
  tolakDate,
  approveTiket,
  tolakTiket,
  reworkMtc,
  cekMonitoring,
  getProsesMtc,
} = require("../../controller/mtc/prosesMtc");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/prosessMtcById/:id", getProsesMtcById);
router.get("/prosessMtcByIdTicket/:id", getProsesMtcByTicket);
router.get("/ticket/respon/:id", auth, responseMtc);
router.put("/ticket/analisis/:id", analisisMtc);
router.put("/ticket/delete/:id", deleteProses);
router.put("/ticket/pending/:id", pendingProses);
//router.put("/ticket/selectMtc/:id",  selectMtc);
router.put("/ticket/requestedDate/:id", requestedDate);
router.put("/ticket/approveDate/:id", approveDate);
router.put("/ticket/tolakDate/:id", tolakDate);
router.put("/ticket/approve/:id", approveTiket);
router.put("/ticket/tolak/:id", tolakTiket);
router.put("/ticket/rework/:id", reworkMtc);
router.get("/cekMonitoringOs2", cekMonitoring);
router.get("/prosessMtc", getProsesMtc);

module.exports = router;
