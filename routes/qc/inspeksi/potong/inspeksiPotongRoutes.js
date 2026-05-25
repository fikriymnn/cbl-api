const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPotong = require("../../../../controller/qc/inspeksi/potong/inspeksiPotongController");

router.get(
  "/qc/cs/inspeksiPotong/:id?",
  auth,
  inspeksiPotong.getInspeksiPotong
);
router.get(
  "/qc/cs/inspeksiPotongMesin",
  auth,
  inspeksiPotong.getInspeksiPotongMesin
);
router.post("/qc/cs/inspeksiPotong", inspeksiPotong.createInpeksiPotong);
//update
router.put(
  "/qc/cs/inspeksiPotong/update/:id",
  auth,
  inspeksiPotong.updateInspeksiPotong
);
// start and stop
router.get(
  "/qc/cs/inspeksiPotong/start/:id",
  auth,
  inspeksiPotong.startInspeksiPotong
);
router.put(
  "/qc/cs/inspeksiPotong/stop/:id",
  auth,
  inspeksiPotong.stopInspeksiPotong
);
//done potong
router.put(
  "/qc/cs/inspeksiPotong/done/:id",
  auth,
  inspeksiPotong.doneInspeksiPotong
);

module.exports = router;
