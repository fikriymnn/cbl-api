const router = require("express").Router();
const masterJenisKertas = require("../../controller/masterData/masterJenisKertasController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/master/jenisKertas/:id?", masterJenisKertas.getMasterJenisKertas);
router.post(
  "/master/jenisKertas",
  auth,
  masterJenisKertas.createMasterJenisKertas
);
router.put(
  "/master/jenisKertas/:id",
  auth,
  masterJenisKertas.updateMasterJenisKertas
);
router.delete(
  "/master/jenisKertas/:id",
  auth,
  masterJenisKertas.deleteMasterJenisKertas
);

module.exports = router;
