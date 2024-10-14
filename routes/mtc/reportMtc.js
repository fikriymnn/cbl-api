const router = require("express").Router();
const reportMtc = require("../../controller/mtc/reportMtc");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/reportMtc/responTime", reportMtc.getDataResponTime);

module.exports = router;
