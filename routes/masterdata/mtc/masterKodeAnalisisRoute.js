const router = require("express").Router();
const {
  createMasterKode,
  deleteMasterKode,
  getMasterKode,
  getMasterKodeById,
  updateMasterKode,
} = require("../../../controller/masterData/mtc/kodeAnalisisController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/kodeAnalisis", getMasterKode);
router.get("/master/kodeAnalisis/:id", getMasterKodeById);
router.post("/master/kodeAnalisis", auth, createMasterKode);
router.put("/master/kodeAnalisis/:id", auth, updateMasterKode);
router.delete("/master/kodeAnalisis/:id", auth, deleteMasterKode);

module.exports = router;
