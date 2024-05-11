const router = require("express").Router();
const {
  createMasterKode,
  deleteMasterKode,
  getMasterKode,
  getMasterKodeById,
  updateMasterKode,
} = require("../../../controller/masterData/mtc/kodeAnalisisController");
const { Auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/kodeAnalisis", getMasterKode);
router.get("/master/kodeAnalisis/:id", getMasterKodeById);
router.post("/master/kodeAnalisis", Auth, createMasterKode);
router.put("/master/kodeAnalisis/:id", Auth, updateMasterKode);
router.delete("/master/kodeAnalisis/:id", Auth, deleteMasterKode);

module.exports = router;
