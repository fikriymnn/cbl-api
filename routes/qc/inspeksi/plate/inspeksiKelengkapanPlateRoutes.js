const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiKelengkapanPlate = require("../../../../controller/qc/inspeksi/plate/inspeksiKelengkapanPlateController");

router.get(
  "/qc/cs/inspeksiKelengkapanPlate/:id?",
  auth,
  inspeksiKelengkapanPlate.getInspeksiKelengkapanPlate
);
router.get(
  "/qc/cs/inspeksiKelengkapanPlateMesin",
  auth,
  inspeksiKelengkapanPlate.getInspeksiKelengkapanPlateMesin
);

//done potong
router.put(
  "/qc/cs/inspeksiKelengkapanPlate/check/:id",
  auth,
  inspeksiKelengkapanPlate.checkInspeksiKelengkapanPlate
);

module.exports = router;
