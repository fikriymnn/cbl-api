const router = require("express").Router();
const {getMasterMesin, getMasterMesinById, createMasterMesin, updateMasterMesin, deleteMasterMachine} = require("../../controller/masterData/masterMesinController")
const { Auth } = require("../../middlewares/authMiddlewares");

router.get("/master/mesin", getMasterMesin);
router.get("/master/mesin/:id", getMasterMesinById);
router.post("/master/mesin",Auth, createMasterMesin);
router.put("/master/mesin/:id",Auth, updateMasterMesin);
router.delete("/master/mesin/:id", Auth, deleteMasterMachine )


module.exports = router;