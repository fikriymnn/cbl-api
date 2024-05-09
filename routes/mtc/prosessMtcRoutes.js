const router = require("express").Router();
const {
  getProsesMtcByTicket,
  getProsesMtcById,
  responseMtc,
  analisisMtc,
  pendingProses,
  requestedDate,
  approveDate,
  tolakDate,
  approveTiket,
  tolakTiket,
  reworkMtc,
} = require("../../controller/mtc/prosesMtc");
const { Auth } = require("../../middlewares/authMiddlewares");

router.get("/prosessMtcById/:id", getProsesMtcById);
router.get("/prosessMtcByIdTicket/:id", getProsesMtcByTicket);
router.get("/ticket/respon/:id", Auth, responseMtc);
router.put("/ticket/analisis/:id", Auth, analisisMtc);
router.put("/ticket/pending/:id", Auth, pendingProses);
//router.put("/ticket/selectMtc/:id", Auth, selectMtc);
router.put("/ticket/requestedDate/:id", Auth, requestedDate);
router.put("/ticket/approveDate/:id", Auth, approveDate);
router.put("/ticket/tolakDate/:id", Auth, tolakDate);
router.put("/ticket/approve/:id", Auth, approveTiket);
router.put("/ticket/tolak/:id", Auth, tolakTiket);
router.put("/ticket/rework/:id", Auth, reworkMtc);

module.exports = router;
