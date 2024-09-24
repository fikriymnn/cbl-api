const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPraPlate = require("../../../../controller/qc/inspeksi/plate/inspeksiPraPlateController");

router.get(
  "/qc/cs/inspeksiPraPlate/:id?",
  auth,
  inspeksiPraPlate.getInspeksiPraPlate
);
router.get(
  "/qc/cs/inspeksiPraPlateMesin",
  auth,
  inspeksiPraPlate.getInspeksiPraPlateMesin
);
router.post("/qc/cs/inspeksiPlate", inspeksiPraPlate.createInpeksiPlate);
//update
router.put(
  "/qc/cs/inspeksiPraPlate/update/:id",
  inspeksiPraPlate.updateInspeksiPraPlate
);
// start and stop
router.get(
  "/qc/cs/inspeksiPraPlate/start/:id",
  auth,
  inspeksiPraPlate.startInspeksiPraPlate
);
// router.put(
//   "/qc/cs/inspeksiPraPlate/save/:id",
//   inspeksiPraPlate.saveInspeksiPraPlatePoint
// );
// //add point
// router.put(
//   "/qc/cs/inspeksiPraPlate/addPoint/:id",
//   inspeksiPraPlate.tambahPointLipat
// );
//done potong
router.put(
  "/qc/cs/inspeksiPraPlate/done/:id",
  inspeksiPraPlate.doneInspeksiPraPlate
);

module.exports = router;
