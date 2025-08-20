const router = require("express").Router();
const MasterCustomerController = require("../../../controller/masterData/marketing/masterCustomerController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/marketing/customer/:id?",
  auth,
  MasterCustomerController.getMasterCustomer
);
router.post(
  "/master/marketing/customer",
  auth,
  MasterCustomerController.createMasterCustomer
);
router.put(
  "/master/marketing/customer/:id",
  auth,
  MasterCustomerController.updateMasterCustomer
);
router.delete(
  "/master/marketing/customer/:id",
  auth,
  MasterCustomerController.deleteMasterCustomer
);

module.exports = router;
