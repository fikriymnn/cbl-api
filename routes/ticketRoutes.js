const router = require("express").Router();
const {createTiket, getTicket, getTiketById, updateTiket, updateTiketTypeMtc, approveTiket} = require("../controller/maintenaceTicketController");
const { Auth } = require("../middlewares/authMiddlewares");

router.get("/ticket/:id", getTiketById);
router.get("/ticket", getTicket);
router.post("/ticket", createTiket);
router.put("/ticket/:id",Auth, updateTiket);
router.put("/ticket/typeMtc/:id",Auth, updateTiketTypeMtc);
router.put("/ticket/approve/:id",Auth, approveTiket);

module.exports = router;