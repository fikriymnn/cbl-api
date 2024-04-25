const router = require("express").Router();
const {
  getStokSparepart,
  getStokSparepartById,
  createStokSparepart,
  updateStokSparepart,
  deleteStokSparepart,
  addStokSparepart,
  approveRequestStokSparepart,
  tolakRequestStokSparepart,
} = require("../../controller/mtc/stokSparepart");
const { Auth } = require("../../middlewares/authMiddlewares");

router.get("/stokSparepart", getStokSparepart);
router.get("/stokSparepart/:id", getStokSparepartById);
router.post("/stokSparepart", createStokSparepart);
router.put("/stokSparepart/:id", updateStokSparepart);
router.delete("/stokSparepart/:id", deleteStokSparepart);
router.put("/approveStokSparepart/:id", approveRequestStokSparepart);
router.delete("/tolakStokSparepart/:id", tolakRequestStokSparepart);
router.post("/addStokSparepart/:id", addStokSparepart);

module.exports = router;
