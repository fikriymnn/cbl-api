const router = require("express").Router();
const KalibrasiAlatUkurController = require("../../../controller/qc/kalibrasiAlatUkur/kalibrasiAlatUkurController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/qc/kalibrasiAlatUkur/:id?",
  KalibrasiAlatUkurController.getKalibrasiAlatUkur
);
router.post(
  "/qc/kalibrasiAlatUkur",
  KalibrasiAlatUkurController.createKalibrasiAlatUkur
);
router.put(
  "/qc/kalibrasiAlatUkur/:id",
  auth,
  KalibrasiAlatUkurController.updateKalibrasiAlatUkur
);

//cek masa kadaluarsa
router.get(
  "/qc/checkMasaBerlakukalibrasiAlatUkur",
  KalibrasiAlatUkurController.checkExparedKalibrasiAlatUkur
);

module.exports = router;
