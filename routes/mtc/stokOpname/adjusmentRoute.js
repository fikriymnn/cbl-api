const router = require("express").Router();
const { auth } = require("../../../middlewares/authMiddlewares");
const AdjusmentSparepart = require("../../../controller/mtc/stokOpname/adjusmentController");

router.get(
  "/mtc/stokOpname/AdjusmentSparepart/:id?",
  AdjusmentSparepart.getAdjusmentSparepart
);
router.post(
  "/mtc/stokOpname/AdjusmentSparepart",
  auth,
  AdjusmentSparepart.createAdjusmentSparepart
);

module.exports = router;
