const router = require("express").Router();

const jadwalKirimController = require("../../../controller/ppic/jadwalKirim/jadwalKirimController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/ppic/jadwalKirim", jadwalKirimController.getJadwalKirim);

module.exports = router;
