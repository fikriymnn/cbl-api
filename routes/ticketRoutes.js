const router = require("express").Router();
const {
  createTiket,
  getTicket,
  getTiketById,
  updateTiket,
  selectMtc,
  getTiketUser,
  injectDataTicket,
  validasiQcTiket,
  rejectQcTiket,
} = require("../controller/maintenaceTicketController");
const { auth } = require("../middlewares/authMiddlewares");

router.get("/ticket/:id", getTiketById);
router.get("/ticket", getTicket);
router.get("/ticketUsers", auth, getTiketUser);
router.post("/ticket", createTiket);
router.put("/ticket/:id", auth, updateTiket);
router.put("/ticket/validate/:id", auth, validasiQcTiket);
router.put("/ticket/tolak/:id", auth, rejectQcTiket);
router.post("/injectData", injectDataTicket);

module.exports = router;
