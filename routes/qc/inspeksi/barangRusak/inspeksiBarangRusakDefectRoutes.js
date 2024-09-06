const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiBarangRusakDefect = require("../../../../controller/qc/inspeksi/barangRusak/inspeksiBarangRusakDefectController");

router.post(
  "/qc/cs/inspeksiBarangRusak/createDefect/:id",
  auth,
  inspeksiBarangRusakDefect.addInspeksiBarangRusak
);

router.put(
  "/qc/cs/inspeksiBarangRusak/save/:id",
  auth,
  inspeksiBarangRusakDefect.stopCetakPeriodePoint
);

module.exports = router;
