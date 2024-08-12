const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetakPeriodeDefect = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectController");

router.post(
  "/qc/cs/inspeksiCetakPeriodePoint/createDefect",
  auth,
  inspeksiCetakPeriodeDefect.addInspeksiCetakDefect
);

module.exports = router;
