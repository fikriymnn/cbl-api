const router = require("express").Router();
const reportMtc = require("../../controller/mtc/reportMtc");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/reportMtc/responTime", reportMtc.getDataResponTime);
router.get("/reportMtc/mesinProblem", reportMtc.getCaseMesinProblem);
router.get("/reportMtc/produksiDefect", reportMtc.getProduksiDefect);
router.get("/reportMtc/qualityDefect", reportMtc.getQualityDefect);

module.exports = router;
