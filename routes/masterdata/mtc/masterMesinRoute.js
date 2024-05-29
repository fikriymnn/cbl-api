const router = require("express").Router();
const {
  getMasterMesin,
  getMasterMesinById,
  createMasterMesin,
  updateMasterMesin,
  deleteMasterMachine,
} = require("../../../controller/masterData/masterMesinController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/mesin", getMasterMesin);
router.get("/master/mesin/:id", getMasterMesinById);
router.post("/master/mesin", auth, createMasterMesin);
router.put("/master/mesin/:id", auth, updateMasterMesin);
router.delete("/master/mesin/:id", auth, deleteMasterMachine);

module.exports = router;
