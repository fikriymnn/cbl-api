const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiLemPeriode = require("../../../../controller/qc/inspeksi/lem/inspeksiLemPeriodeController");

router.put(
  "/qc/cs/inspeksiLemPeriode/done/:id",
  auth,
  inspeksiLemPeriode.doneLemPeriode
);

router.put(
  "/qc/cs/inspeksiLemPeriode/pending/:id",
  auth,
  inspeksiLemPeriode.pendingLemPeriode
);

module.exports = router;
