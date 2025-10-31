const router = require("express").Router();
const MasterWasteKendala = require("../../../controller/masterData/kodeProduksi/masterWasteKendalaController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/master/produksi/wasteKendala/:id?",
  auth,
  MasterWasteKendala.getMasterWasteKendala
);
router.post(
  "/master/produksi/wasteKendala",
  auth,
  MasterWasteKendala.createMasterWasteKendala
);
router.put(
  "/master/produksi/wasteKendala",
  auth,
  MasterWasteKendala.updateMasterWasteKendala
);
// router.delete(
//   "/master/produksi/kodeProduksi/:id",
//   auth,
//   MasterWasteKendala.deleteMasterKodeProduksi
// );

module.exports = router;
