const router = require("express").Router();
const KapasitasMesinController = require("../../../controller/ppic/kapasitasMesin/kapasitasMesinController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/ppic/kapasitasMesin/:id?",
  auth,
  KapasitasMesinController.getKapasitasMesin
);
router.post(
  "/ppic/kapasitasMesin",
  auth,
  KapasitasMesinController.createKapasitasMesin
);
router.put(
  "/ppic/kapasitasMesin/:id",
  auth,
  KapasitasMesinController.updateKapasitasMesin
);

router.delete(
  "/ppic/kapasitasMesin/:id",
  auth,
  KapasitasMesinController.deleteKapasitasMesin
);
module.exports = router;
