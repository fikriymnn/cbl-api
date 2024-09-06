const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiLemAwal = require("../../../../controller/qc/inspeksi/lem/inspeksiLemAwalController");

router.put(
  "/qc/cs/inspeksiLemAwal/done/:id",
  auth,
  inspeksiLemAwal.doneLemAwal
);

router.put(
  "/qc/cs/inspeksiLemAwal/pending/:id",
  auth,
  inspeksiLemAwal.pendingLemAwal
);

module.exports = router;
