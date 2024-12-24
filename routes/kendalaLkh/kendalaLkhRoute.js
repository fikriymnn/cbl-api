const router = require("express").Router();
const KendalaLkhController = require("../../controller/kendalaLkh/kendalaLkhController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get("/kendalaLkh/:id?", KendalaLkhController.getKendalaLkh);
router.post("/kendalaLkh", KendalaLkhController.createTiket);
router.put(
  "/kendalaLkh/validate/:id",
  auth,
  KendalaLkhController.validasiQcKendalaLkh
);
router.put(
  "/kendalaLkh/reject/:id",
  auth,
  KendalaLkhController.rejectQcKendalaLkh
);
// router.post("/ncr", ncr.createNcrTicket);
// router.put("/ncr/:id", auth, ncr.updateNcrTicket);
// router.put("/ncr/department/:id", auth, ncr.updateNcrDepartment);
// router.put("/ncr/validasiQa/:id", auth, ncr.validasiNcrQa);
// router.put("/ncr/validasiMr/:id", auth, ncr.validasiNcrMr);
// router.delete("/logout", Logout);

module.exports = router;
