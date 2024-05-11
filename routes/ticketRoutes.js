const router = require("express").Router();
const {
  createTiket,
  getTicket,
  getTiketById,
  updateTiket,
  approveTiket,
  //beginTiket,
  responseMtc,
  //finishMtc,
  tolakTiket,
  requestedDate,
  approveDate,
  tolakDate,
  selectMtc,
  getTiketUser,
  reworkMtc,
  analisisMtc,
} = require("../controller/maintenaceTicketController");
const { Auth } = require("../middlewares/authMiddlewares");

router.get("/ticket/:id", getTiketById);
router.get("/ticket", getTicket);
router.get("/ticketUsers", Auth, getTiketUser);
router.post("/ticket", createTiket);
router.put("/ticket/:id", Auth, updateTiket);

module.exports = router;
