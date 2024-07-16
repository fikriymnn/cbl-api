const router = require("express").Router();
const {
  getDataPerbandinganOs2Os3,
  getDataDetailMesinProblem,
} = require("../../controller/mtc/dashboardMtc");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/dashboardMtc/perbandinganOs", getDataPerbandinganOs2Os3);
router.get("/dashboardMtc/mesinProblem", getDataDetailMesinProblem);

module.exports = router;
