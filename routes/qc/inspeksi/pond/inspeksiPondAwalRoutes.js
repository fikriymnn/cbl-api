const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiPondAwal = require("../../../../controller/qc/inspeksi/pond/inspeksiPondAwalController");

router.put(
  "/qc/cs/inspeksiPondAwal/done/:id",
  auth,
  inspeksiPondAwal.donePondAwal
);

module.exports = router;
