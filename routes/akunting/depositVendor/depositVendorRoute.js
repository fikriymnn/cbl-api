const router = require("express").Router();
const DepositVendorController = require("../../../controller/akunting/depositVendor/depositVendorController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/depositVendorSaldo", auth, DepositVendorController.getSaldoVendor);
router.get("/depositVendorNomor", auth, DepositVendorController.getNoDepositVendor);
router.get("/depositVendor/:id?", auth, DepositVendorController.getDepositVendor);
router.post("/depositVendor", auth, DepositVendorController.createDepositVendor);
router.put("/depositVendor/:id", auth, DepositVendorController.updateDepositVendor);
router.put("/depositVendor/request/:id", auth, DepositVendorController.requestDepositVendor);
router.put("/depositVendor/approve/:id", auth, DepositVendorController.approveDepositVendor);
router.put("/depositVendor/reject/:id", auth, DepositVendorController.rejectDepositVendor);
router.delete("/depositVendor/:id", auth, DepositVendorController.deleteDepositVendor);

module.exports = router;
