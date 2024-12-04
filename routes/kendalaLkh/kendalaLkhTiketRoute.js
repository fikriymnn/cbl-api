const router = require("express").Router();
const KendalaLkhTiketController = require("../../controller/kendalaLkh/kendalaLkhTiketController");
const { auth } = require("../../middlewares/authMiddlewares");

router.get(
  "/kendalaLkhTiket/:id?",
  KendalaLkhTiketController.getKendalaLkhTiket
);

router.put(
  "/kendalaLkhTiket/respon/:id",
  KendalaLkhTiketController.responKendalaLkhTiket
);
// router.post("/kendalaLkh", KendalaLkhTiketController.createTiket);
// router.put(
//   "/kendalaLkh/validasi/:id",
//   auth,
//   KendalaLkhTiketController.validasiQcKendalaLkh
// );
// router.put(
//   "/kendalaLkh/reject/:id",
//   auth,
//   KendalaLkhTiketController.rejectQcKendalaLkh
// );
// router.post("/ncr", ncr.createNcrTicket);
// router.put("/ncr/:id", auth, ncr.updateNcrTicket);
// router.put("/ncr/department/:id", auth, ncr.updateNcrDepartment);
// router.put("/ncr/validasiQa/:id", auth, ncr.validasiNcrQa);
// router.put("/ncr/validasiMr/:id", auth, ncr.validasiNcrMr);
// router.delete("/logout", Logout);

module.exports = router;
