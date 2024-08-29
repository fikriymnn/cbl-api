const router = require("express").Router();
const {
  getMasterSparepart,
  getMasterSparepartById,
  createMasterSparepart,
  updateMasterSparepart,
  deleteMasterSparepart,
  kurangUmurMasterSparepart,
} = require("../../../controller/masterData/masterSparepartController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/sparepart", getMasterSparepart);
router.get("/master/sparepart/:id", getMasterSparepartById);
router.post("/master/sparepart", auth, createMasterSparepart);
router.put("/master/sparepart/:id", auth, updateMasterSparepart);
router.delete("/master/sparepart/:id", auth, deleteMasterSparepart);
router.put("/master/sparepartKurangUmur", auth, kurangUmurMasterSparepart);

module.exports = router;
