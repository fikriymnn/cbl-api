const router = require("express").Router();
const {
  getMasterKPI,
  getMasterKPIById,
  updateMasterKPI,
  deleteMasterKPI,
  createMasterKPI,
} = require("../../../../controller/masterData/mtc/kpi/masterKPIController");
const { auth } = require("../../../../middlewares/authMiddlewares");

router.get("/master/kpi", getMasterKPI);
router.get("/master/kpi/:id", getMasterKPIById);
router.post("/master/kpi", createMasterKPI);
router.put("/master/kpi/:id",updateMasterKPI);
router.delete("/master/kpi/:id", deleteMasterKPI);

module.exports = router;