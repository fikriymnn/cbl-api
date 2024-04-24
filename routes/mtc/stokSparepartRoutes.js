const router = require("express").Router();
const {getStokSparepart,getStokSparepartById,createStokSparepart,updateStokSparepart,deleteStokSparepart,addStokSparepart} = require("../../controller/mtc/stokSparepart")
const { Auth } = require("../../middlewares/authMiddlewares");

router.get("/stokSparepart", getStokSparepart);
router.get("/stokSparepart/:id", getStokSparepartById);
router.post("/stokSparepart", createStokSparepart);
router.put("/stokSparepart/:id", updateStokSparepart);
router.delete("/stokSparepart/:id", deleteStokSparepart )
router.put("/addStokSparepart/:id", addStokSparepart);


module.exports = router;