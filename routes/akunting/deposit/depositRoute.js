const router = require("express").Router();
const DepositController = require("../../../controller/akunting/deposit/depositController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/deposit/:id?", auth, DepositController.getDeposit);
router.get("/depositNomor", auth, DepositController.getNoDeposit);
router.post("/deposit", auth, DepositController.createDeposit);
router.put("/deposit/:id", auth, DepositController.updateDeposit);
router.put("/deposit/request/:id", auth, DepositController.requestDeposit);
router.put("/deposit/approve/:id", auth, DepositController.approveDeposit);
router.put("/deposit/reject/:id", auth, DepositController.rejectDeposit);
router.delete("/deposit/:id", auth, DepositController.deleteDeposit);

module.exports = router;
