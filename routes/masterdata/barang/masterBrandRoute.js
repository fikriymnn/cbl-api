const router = require("express").Router();
const MasterBrandController = require("../../../controller/masterData/barang/masterBrandController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get("/master/brand/:id?", auth, MasterBrandController.getMasterBrand);
router.post("/master/brand", auth, MasterBrandController.createMasterBrand);
router.put("/master/brand/:id", auth, MasterBrandController.updateMasterBrand);
router.delete(
  "/master/brand/:id",
  auth,
  MasterBrandController.deleteMasterBrand
);

module.exports = router;
