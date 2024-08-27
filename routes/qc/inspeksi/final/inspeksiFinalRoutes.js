const router = require("express").Router()
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiFinalController = require("../../../../controller/qc/inspeksi/final/inspeksiFinalController");

router.get(
  "/qc/cs/inspeksiFinal/:id?",auth,
  inspeksiFinalController.getInspeksiFinal
);

router.post(
  "/qc/cs/inspeksiFinal",auth,
  inspeksiFinalController.createInspeksiFinal
);

router.put("/qc/cs/inspeksiFinal/:id",auth,inspeksiFinalController.updateInspeksiFinal)


module.exports = router;