const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCetakPeriode = require("../../../../controller/qc/inspeksi/cetak/inspeksiCetakPeriodeController");

router.put(
  "/qc/cs/inspeksiCetakPeriode/done/:id",
  auth,
  inspeksiCetakPeriode.doneCetakPeriode
);
router.put(
  "/qc/cs/inspeksiCetakPeriode/pending/:id",
  auth,
  inspeksiCetakPeriode.pendingCetakPeriode
);

module.exports = router;
