const router = require("express").Router();
const masterCutiKhususController = require("../../../controller/masterData/hr/masterCutiKhususController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/cutiKhusus/:id?",
  masterCutiKhususController.getMasterCutiKhusus
);
router.post(
  "/master/cutiKhusus",
  masterCutiKhususController.createMasterCutiKhusus
);
router.put(
  "/master/cutiKhusus/:id",
  auth,
  masterCutiKhususController.updateMasterCutiKhusus
);
router.delete(
  "/master/cutiKhusus/:id",
  auth,
  masterCutiKhususController.deleteMasterCutiKhusus
);

module.exports = router;
