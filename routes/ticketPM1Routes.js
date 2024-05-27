const router = require("express").Router();
const {
  getTicketOs3,
  getTicketOs3ById,
  createTicket,
  updateTicketOs3,
  deleteTicketOs3,
} = require("../controller/maintenaceTicketOs3Controller");
const { auth } = require("../middlewares/authMiddlewares");

router.get("/ticketPM1", getTicketOs3);
router.get("/ticketPM1/:id", getTicketOs3ById);
router.post("/ticketPM1", auth, createTicket);
router.put("/ticketPM1/:id", auth, updateTicketOs3);
router.delete("/ticketPM1/:id", auth, deleteTicketOs3);

module.exports = router;
