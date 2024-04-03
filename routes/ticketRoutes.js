const router = require("express").Router();
const {createTiket, getTicket, getTiketById} = require("../controller/maintenaceTicketController")

router.get("/ticket/:id", getTiketById);
router.get("/ticket", getTicket);
router.post("/ticket", createTiket);

module.exports = router;