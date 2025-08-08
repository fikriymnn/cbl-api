const router = require("express").Router();
const dotenv = require("dotenv");
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetak = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakController");
const axios = require("axios");

dotenv.config();

router.get("/qc/cs/inspeksiCetak/:id?", inspeksiCetak.getInspeksiCetak);
router.post("/qc/cs/inspeksiCetak", inspeksiCetak.createInspeksiCetak);

router.get("/qc/cs/testingApi", inspeksiCetak.testingApi);

module.exports = router;
