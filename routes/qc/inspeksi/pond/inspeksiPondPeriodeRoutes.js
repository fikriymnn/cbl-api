const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPondPeriode = require("../../../../controller/qc/inspeksi/pond/inspeksiPondPeriodeController");

router.put(
  "/qc/cs/inspeksiPondPeriode/done/:id",
  auth,
  inspeksiPondPeriode.donePondPeriode
);

module.exports = router;