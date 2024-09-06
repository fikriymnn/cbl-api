const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPond = require("../../../../controller/qc/inspeksi/pond/inspeksiPondController");

router.get("/qc/cs/inspeksiPond/:id?", auth, inspeksiPond.getInspeksiPond);
router.post("/qc/cs/inspeksiPond", inspeksiPond.createInspeksiPond);

module.exports = router;
