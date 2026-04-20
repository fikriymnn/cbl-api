const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiLemPeriodeDefect = require("../../../../controller/qc/inspeksi/lem/inspeksiLemPeriodeDefectController");

router.post(
  "/qc/cs/inspeksiLemPeriodePoint/createDefect",
  auth,
  inspeksiLemPeriodeDefect.addInspeksiLemDefect
);

router.put(
  "/qc/cs/inspeksiLemPeriodePoint/updateDefect/:id",
  auth,
  inspeksiLemPeriodeDefect.updateInspeksiLemDefect
);

module.exports = router;
