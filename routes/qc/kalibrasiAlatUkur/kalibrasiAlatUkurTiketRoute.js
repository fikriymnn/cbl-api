const router = require("express").Router();
const KalibrasiAlatUkurTiketController = require("../../../controller/qc/kalibrasiAlatUkur/kalibrasiAlatUkurTiketController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/qc/kalibrasiAlatUkurTiket/:id?",
  KalibrasiAlatUkurTiketController.getKalibrasiAlatUkurTiket
);
router.post(
  "/qc/kalibrasiAlatUkurTiket",
  KalibrasiAlatUkurTiketController.createKalibrasiAlatUkurTiket
);
router.put(
  "/qc/kalibrasiAlatUkurTiket/:id",
  auth,
  KalibrasiAlatUkurTiketController.updateKalibrasiAlatUkurTiket
);
router.put(
  "/qc/kalibrasiAlatUkurTiket/done/:id",
  auth,
  KalibrasiAlatUkurTiketController.doneKalibrasiAlatUkurTiket
);

module.exports = router;
