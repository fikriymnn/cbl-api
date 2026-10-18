const router = require("express").Router();
const GoodReceiptController = require("../../../controller/akunting/goodReceipt/goodReceiptController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/goodReceipt/:id?", auth, GoodReceiptController.getGoodReceipt);

module.exports = router;
