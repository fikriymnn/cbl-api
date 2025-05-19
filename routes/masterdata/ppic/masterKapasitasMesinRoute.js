const router = require("express").Router();
const masterKapasitasMesinController = require("../../../controller/masterData/ppic/masterKapasitasMesinController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/ppic/kapasitasMesin/:id?",
  masterKapasitasMesinController.getMasterKapasitasMesin
);
router.post(
  "/master/ppic/kapasitasMesin",
  auth,
  masterKapasitasMesinController.createMasterKapasitasMesin
);
router.put(
  "/master/ppic/kapasitasMesin/:id",
  auth,
  masterKapasitasMesinController.updateMasterKapasitasMesin
);
router.delete(
  "/master/ppic/kapasitasMesin/:id",
  auth,
  masterKapasitasMesinController.deleteMasterKapasitasMesin
);

module.exports = router;
