const router = require("express").Router();
const {
  getMasalahSparepart,
  getMasalahSparepartById,
  createMasalahSparepart,
  getMasalahSparepartByTicket
} = require("../../controller/mtc/sparepartProblem");
const { Auth } = require("../../middlewares/authMiddlewares");

router.get("/masalahSparepart", getMasalahSparepart);
router.get("/masalahSparepart/:id", getMasalahSparepartById);
router.get("/masalahSparepartByTicket/:id", getMasalahSparepartByTicket);
//router.post("/masalahSparepart", createMasalahSparepart);
// router.put("/stokSparepart/:id", updateStokSparepart);
// router.delete("/stokSparepart/:id", deleteStokSparepart )
// router.put("/addStokSparepart/:id", addStokSparepart);

module.exports = router;
