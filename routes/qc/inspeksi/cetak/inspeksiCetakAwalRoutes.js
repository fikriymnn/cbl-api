const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetakAwal = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakAwalController");

router.put(
  "/qc/cs/inspeksiCetakAwal/done/:id",
  auth,
  inspeksiCetakAwal.doneCetakAwal
);
router.put(
  "/qc/cs/inspeksiCetakAwal/pending/:id",
  auth,
  inspeksiCetakAwal.pendingCetakAwal
);

module.exports = router;
