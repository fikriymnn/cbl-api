const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPondPeriodeDefect = require("../../../../controller/qc/inspeksi/pond/inspeksiPondPeriodeDefectController");

router.post(
  "/qc/cs/inspeksiPondPeriodePoint/createDefect",
  auth,
  inspeksiPondPeriodeDefect.addInspeksiPondDefect
);

router.put(
  "/qc/cs/inspeksiPondPeriodePoint/updateDefect/:id",
  auth,
  inspeksiPondPeriodeDefect.updateInspeksiPondDefect
);

module.exports = router;
