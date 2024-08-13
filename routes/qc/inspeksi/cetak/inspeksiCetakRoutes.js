const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetak = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakController");

router.get("/qc/cs/inspeksiCetak/:id?", auth, inspeksiCetak.getInspeksiCetak);
router.post("/qc/cs/inspeksiCetak", auth, inspeksiCetak.createInspeksiCetak);

module.exports = router;
