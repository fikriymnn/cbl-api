const router = require("express").Router();
const MutasiBarangFinishGoodController = require("../../controller/finishGood/mutasiBarangFinishGood/mutasiBarangFinishGoodController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/fg/mutasiBarang/:id?",
  auth,
  MutasiBarangFinishGoodController.getMutasiBarangFinishGood,
);

router.get(
  "/fg/mutasiBarangByJo",
  auth,
  MutasiBarangFinishGoodController.getMutasiBarangFinishGoodByJo,
);

module.exports = router;
