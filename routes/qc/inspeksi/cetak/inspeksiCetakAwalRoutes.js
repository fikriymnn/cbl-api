const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetakAwal = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakAwalController");

router.put(
  "/qc/cs/inspeksiCetakAwal/done/:id",
  auth,
  inspeksiCetakAwal.doneCetakAwal
);

module.exports = router;
