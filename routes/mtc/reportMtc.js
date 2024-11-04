const router = require("express").Router();
const reportMtc = require("../../controller/mtc/reportMtc");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/reportMtc/mesinTicket", reportMtc.getMesinByTicket);
router.get("/reportMtc/responTime", reportMtc.getDataResponTimeRange);
router.get("/reportMtc/responTimeMinggu", reportMtc.getDataResponTimeMinggu);
router.get("/reportMtc/mesinProblem", reportMtc.getCaseMesinProblem);
router.get("/reportMtc/oneMesinProblem", reportMtc.getCaseOneMesinProblem);
router.get("/reportMtc/produksiDefect", reportMtc.getProduksiDefect);
router.get("/reportMtc/qualityDefect", reportMtc.getQualityDefect);

module.exports = router;
