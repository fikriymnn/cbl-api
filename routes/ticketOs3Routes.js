const router = require("express").Router();
const {
  getTicketOs3,
  getTicketOs3ById,
  createTicket,
  updateTicketOs3,
  deleteTicketOs3,
} = require("../controller/maintenaceTicketOs3Controller");
const { auth } = require("../middlewares/authMiddlewares");

router.get("/ticketOs3", getTicketOs3);
router.get("/ticketOs3/:id", getTicketOs3ById);
router.post("/ticketOs3", auth, createTicket);
router.put("/ticketOs3/:id", auth, updateTicketOs3);
router.delete("/ticketOs3/:id", auth, deleteTicketOs3);

module.exports = router;
