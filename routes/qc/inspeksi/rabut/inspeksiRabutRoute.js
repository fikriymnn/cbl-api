const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiRabut = require("../../../../controller/qc/inspeksi/rabut/inspeksiRabutController");

router.get("/qc/cs/inspeksiRabut/:id?", auth, inspeksiRabut.getInspeksiRabut);
router.post("/qc/cs/inspeksiRabut", auth, inspeksiRabut.createInspeksiRabut);
router.put(
  "/qc/cs/inspeksiRabut/done/:id",
  auth,
  inspeksiRabut.doneInspeksiRabut
);

module.exports = router;