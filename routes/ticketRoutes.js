const router = require("express").Router();
const {
  createTiket,
  getTicket,
  getTiketById,
  updateTiket,
  approveTiket,
  beginTiket,
  responseMtc,
  finishMtc,
  tolakTiket,
  requestedDate,
  approveDate,
  tolakDate,
  selectMtc,
  getTiketUser,
  reworkMtc,
} = require("../controller/maintenaceTicketController");
const { Auth } = require("../middlewares/authMiddlewares");

router.get("/ticket/:id", getTiketById);
router.get("/ticket", getTicket);
router.get("/ticketUsers", Auth, getTiketUser);
router.post("/ticket", createTiket);
router.put("/ticket/:id", Auth, updateTiket);
router.put("/ticket/respon/:id", Auth, responseMtc);
router.put("/ticket/selectMtc/:id", Auth, selectMtc);
// router.put("/ticket/typeMtc/:id",Auth, updateTiketTypeMtc);
router.put("/ticket/requestedDate/:id", Auth, requestedDate);
router.put("/ticket/approveDate/:id", Auth, approveDate);
router.put("/ticket/tolakDate/:id", Auth, tolakDate);
router.put("/ticket/begin/:id", Auth, beginTiket);
router.put("/ticket/finish/:id", Auth, finishMtc);
router.put("/ticket/approve/:id", Auth, approveTiket);
router.put("/ticket/tolak/:id", Auth, tolakTiket);
router.put("/ticket/rework/:id", Auth, reworkMtc);

module.exports = router;
