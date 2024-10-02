const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiLipat = require("../../../../controller/qc/inspeksi/lipat/inspeksiLipatController");

router.get("/qc/cs/inspeksiLipat/:id?", auth, inspeksiLipat.getInspeksiLipat);
router.get(
  "/qc/cs/inspeksiLipatMesin",
  auth,
  inspeksiLipat.getInspeksiLipatMesin
);
router.post("/qc/cs/inspeksiLipat", inspeksiLipat.createInpeksiPotong);
//update
router.put(
  "/qc/cs/inspeksiLipat/update/:id",
  inspeksiLipat.updateInspeksiLipat
);
// start and stop
router.get(
  "/qc/cs/inspeksiLipat/start/:id",
  auth,
  inspeksiLipat.startInspeksiLipat
);
router.put("/qc/cs/inspeksiLipat/stop/:id", auth, inspeksiLipat.stopLipatPoint);
router.put(
  "/qc/cs/inspeksiLipat/save/:id",
  inspeksiLipat.saveInspeksiLipatPoint
);
//add point
router.put("/qc/cs/inspeksiLipat/addPoint/:id", inspeksiLipat.tambahPointLipat);
//done potong
router.put("/qc/cs/inspeksiLipat/done/:id", inspeksiLipat.doneInspeksiLipat);

module.exports = router;
