const router = require("express").Router();
const {
  getKPIActual,
  getKPIActualById,
  updateKPIActual,
  deleteKPIActual,
  createKPIActual,
} = require("../../../controller/mtc/kpi/kpiActualController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/kpi", getKPIActual);
router.get("/kpi/:id", getKPIActualById);
router.post("/kpi", createKPIActual);
router.put("/kpi/:id",updateKPIActual);
router.delete("/kpi/:id", deleteKPIActual);

module.exports = router;