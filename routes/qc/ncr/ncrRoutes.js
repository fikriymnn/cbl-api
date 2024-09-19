const router = require("express").Router();
const ncr = require("../../../controller/qc/ncr/ncrTicketController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/ncr/:id?", ncr.getNcrTicket);
router.post("/ncr", ncr.createNcrTicket);
router.put("/ncr/:id", auth, ncr.updateNcrTicket);
router.put("/ncr/department/:id", auth, ncr.updateNcrDepartment);
router.put("/ncr/validasiQa/:id", auth, ncr.validasiNcrQa);
router.put("/ncr/validasiMr/:id", auth, ncr.validasiNcrMr);
// router.delete("/logout", Logout);

module.exports = router;
