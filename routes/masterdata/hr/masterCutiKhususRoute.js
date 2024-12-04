const router = require("express").Router();
const masterCutiKhususController = require("../../../controller/masterData/hr/masterCutiKhususController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/hr/cutiKhusus/:id?",
  masterCutiKhususController.getMasterCutiKhusus
);
router.post(
  "/master/hr/cutiKhusus",
  masterCutiKhususController.createMasterCutiKhusus
);
router.put(
  "/master/hr/cutiKhusus/:id",
  auth,
  masterCutiKhususController.updateMasterCutiKhusus
);
router.delete(
  "/master/hr/cutiKhusus/:id",
  auth,
  masterCutiKhususController.deleteMasterCutiKhusus
);

module.exports = router;
