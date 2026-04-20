const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetakPeriodeDefect = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectController");

router.post(
  "/qc/cs/inspeksiCetakPeriodePoint/createDefect",
  auth,
  inspeksiCetakPeriodeDefect.addInspeksiCetakDefect
);

router.put(
  "/qc/cs/inspeksiCetakPeriodePoint/updateDefect/:id",
  auth,
  inspeksiCetakPeriodeDefect.updateInspeksiCetakDefect
);

module.exports = router;
