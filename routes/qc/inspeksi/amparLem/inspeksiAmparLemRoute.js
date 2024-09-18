const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiAmparLem = require("../../../../controller/qc/inspeksi/amparLem/inspeksiAmparLemController");

router.get(
  "/qc/cs/inspeksiAmparLem/:id?",
  auth,
  inspeksiAmparLem.getInspeksiAmparLem
);
router.post("/qc/cs/inspeksiAmparLem", inspeksiAmparLem.createInspeksiAmparLem);
router.put(
  "/qc/cs/inspeksiAmparLem/done/:id",
  auth,
  inspeksiAmparLem.doneInspeksiAmparLem
);

router.put(
  "/qc/cs/inspeksiAmparLem/pending/:id",
  auth,
  inspeksiAmparLem.pendingAmparLemPeriode
);

module.exports = router;
