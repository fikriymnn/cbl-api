const router = require("express").Router();
const {
  getProsesHistoryQcMtc,
  getProsesMtcByTicket,
  getProsesMtcById,
  responseMtc,
  analisisMtc,
  verifikasiQc,
  rejectQcTicket,
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

router.get("/prosessMtcHistoryQc", getProsesHistoryQcMtc);
router.get("/prosessMtcById/:id", getProsesMtcById);
router.get("/prosessMtcByIdTicket/:id", getProsesMtcByTicket);
router.get("/ticket/respon/:id", auth, responseMtc);
router.put("/ticket/analisis/:id", auth, analisisMtc);
router.put("/ticket/verifikasiQc/:id", verifikasiQc);
router.put("/ticket/rejectQc/:id", rejectQcTicket);
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
