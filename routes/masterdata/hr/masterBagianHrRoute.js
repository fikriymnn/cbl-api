const router = require("express").Router();
const masterBagianHrController = require("../../../controller/masterData/hr/masterBagianHrController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/hr/bagian/:id?",
  masterBagianHrController.getMasterBagianHr
);
router.post("/master/hr/bagian", masterBagianHrController.createMasterBagianHr);
router.put(
  "/master/hr/bagian/:id",
  auth,
  masterBagianHrController.updateMasterBagianHr
);

module.exports = router;
