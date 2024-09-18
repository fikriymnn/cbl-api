const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiLipatResult = require("../../../../controller/qc/inspeksi/lipat/inspeksiLipatResultController");

router.put(
  "/qc/cs/inspeksiLipatResult/:id",
  inspeksiLipatResult.updateInspeksiLipatResult
);

module.exports = router;
