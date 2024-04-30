const router = require("express").Router();
const {
  getProsesMtcByTicket,
  getProsesMtcById,
} = require("../../controller/mtc/prosesMtc");
// const { Auth } = require("../../middlewares/authMiddlewares");

router.get("/prosessMtcById/:id", getProsesMtcById);
router.get("/prosessMtcByIdTicket/:id", getProsesMtcByTicket);
//router.get("/ticket", getTicket);

module.exports = router;
