const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiOutsourcingBJController = require("../../../../controller/qc/inspeksi/outsourcingBJ/inspeksiOutsourcingBJController");

router.get(
  "/qc/cs/inspeksiOutsourcingBJ/:id?",
  auth,
  inspeksiOutsourcingBJController.getInspeksiOutsourcingBJ
);

router.post(
  "/qc/cs/inspeksiOutsourcingBJ",
  inspeksiOutsourcingBJController.createInspeksiOutsourcingBJ
);

router.put(
  "/qc/cs/inspeksiOutsourcingBJ/:id",
  auth,
  inspeksiOutsourcingBJController.updateInspeksiOutsourcingBJ
);

module.exports = router;
