const router = require("express").Router();
const {
  getKPITicket,
  getKPITicketById,
  updateKPITicket,
  deleteKPITicket,
  createKPITicket,
} = require("../../../controller/mtc/kpi/kpiTicketController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/kpi", getKPITicket);
router.get("/kpi/:id", getKPITicketById);
router.post("/kpi", createKPITicket);
router.put("/kpi/:id",updateKPITicket);
router.delete("/kpi/:id", deleteKPITicket);

module.exports = router;