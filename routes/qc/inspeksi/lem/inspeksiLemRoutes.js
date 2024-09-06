const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiLem = require("../../../../controller/qc/inspeksi/lem/inspeksiLemController");

router.get("/qc/cs/inspeksiLem/:id?", auth, inspeksiLem.getInspeksiLem);
router.post("/qc/cs/inspeksiLem", inspeksiLem.createInspeksiLem);

module.exports = router;
