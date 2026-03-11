const router = require("express").Router();
const PembuatanStandarWarnaController = require("../../../controller/ppic/pembuatanStandarWarna/pembuatanStandarWarnaController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/ppic/pembuatanStandarWarna/:id?",
  auth,
  PembuatanStandarWarnaController.getPembuatanStandarWarna,
);
router.put(
  "/ppic/pembuatanStandarWarna/approve/:id",
  auth,
  PembuatanStandarWarnaController.ApprovePembuatanStandarWarna,
);

router.put(
  "/ppic/pembuatanStandarWarna/reject/:id",
  auth,
  PembuatanStandarWarnaController.rejectPembuatanStandarWarna,
);
module.exports = router;
