const router = require("express").Router();
const {getMasterSparepart, getMasterSparepartById, createMasterSparepart, updateMasterSparepart, deleteMasterSparepart} = require("../../controller/masterData/masterSparepartController")
const { Auth } = require("../../middlewares/authMiddlewares");

router.get("/master/Sparepart", getMasterSparepart);
router.get("/master/Sparepart/:id", getMasterSparepartById);
router.post("/master/Sparepart",Auth, createMasterSparepart);
router.put("/master/Sparepart/:id",Auth, updateMasterSparepart);
router.delete("/master/Sparepart/:id", Auth, deleteMasterSparepart )


module.exports = router;