const router = require("express").Router();
const MasterGrupKodeAnalisisController = require("../../../controller/masterData/mtc/grupKodeAnalisis/grupKodeAnalisisController");
const { auth } = require("../../../middlewares/authMiddlewares");

//main route
router.get(
  "/master/kodeAnalisisGrup/:id?",
  MasterGrupKodeAnalisisController.getMasterAnalisisGrup
);
router.post(
  "/master/kodeAnalisisGrup/main",
  auth,
  MasterGrupKodeAnalisisController.createMasterKodeMain
);
router.put(
  "/master/kodeAnalisisGrup/main/:id",
  auth,
  MasterGrupKodeAnalisisController.updateMasterKodeMain
);
router.delete(
  "/master/kodeAnalisisGrup/main/:id",
  auth,
  MasterGrupKodeAnalisisController.deleteMasterKodeMain
);

//child route
router.post(
  "/master/kodeAnalisisGrup/child",
  auth,
  MasterGrupKodeAnalisisController.createMasterKodeChild
);
router.delete(
  "/master/kodeAnalisisGrup/child/:id",
  auth,
  MasterGrupKodeAnalisisController.deleteMasterKodeChild
);

module.exports = router;
