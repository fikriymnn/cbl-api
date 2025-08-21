const router = require("express").Router();
const {
  getProsesMtcOs3ByTicket,
  getProsesMtcOs3ById,
  responseMtcOs3,
  analisisMtcOs3,
  pendingProsesOs3,
  requestedDateOs3,
  approveDateOs3,
  tolakDateOs3,
  approveTiketOs3,
  tolakTiketOs3,
  reworkMtcOs3,
  cekMonitoringOs3,
} = require("../../controller/mtc/prosesMtcOs3");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/prosessMtcOs3ById/:id", getProsesMtcOs3ById);
router.get("/prosessMtcOs3ByIdTicket/:id", getProsesMtcOs3ByTicket);
router.get("/ticketOs3/respon/:id", auth, responseMtcOs3);
router.put("/ticketOs3/analisis/:id", auth, analisisMtcOs3);
router.put("/ticketOs3/pending/:id", auth, pendingProsesOs3);
//router.put("/ticketOs3/selectMtc/:id", auth, selectMtc);
router.put("/ticketOs3/requestedDateOs3/:id", auth, requestedDateOs3);
router.put("/ticketOs3/approveDateOs3/:id", auth, approveDateOs3);
router.put("/ticketOs3/tolakDateOs3/:id", auth, tolakDateOs3);
router.put("/ticketOs3/approve/:id", auth, approveTiketOs3);
router.put("/ticketOs3/tolak/:id", auth, tolakTiketOs3);
router.put("/ticketOs3/rework/:id", auth, reworkMtcOs3);
router.get("/cekMonitoringOs3", cekMonitoringOs3);

module.exports = router;
