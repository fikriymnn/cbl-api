const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiRabut = require("../../../../controller/qc/inspeksi/rabut/inspeksiRabutController");

router.get("/qc/cs/inspeksiRabut/:id?", auth, inspeksiRabut.getInspeksiRabut);
router.post("/qc/cs/inspeksiRabut", inspeksiRabut.createInspeksiRabut);
router.put(
  "/qc/cs/inspeksiRabut/done/:id",
  auth,
  inspeksiRabut.doneInspeksiRabut
);

router.put(
  "/qc/cs/inspeksiRabut/pending/:id",
  auth,
  inspeksiRabut.pendingLemPeriode
);

module.exports = router;
