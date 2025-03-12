const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiChemical = require("../../../../controller/qc/inspeksi/chemical/inspeksiChemicalController");

router.get(
  "/qc/cs/inspeksiChemical/:id?",
  inspeksiChemical.getInspeksiChemical
);
router.post("/qc/cs/inspeksiChemical", inspeksiChemical.createInspeksiChemical);
router.delete(
  "/qc/cs/inspeksiChemical/:id",
  inspeksiChemical.deleteInspeksiChemical
);
//update
router.put(
  "/qc/cs/inspeksiChemical/done/:id",
  inspeksiChemical.doneInspeksiChemical
);
//start and stop
router.put(
  "/qc/cs/inspeksiChemical/start/:id",
  auth,
  inspeksiChemical.startInspeksiChemical
);
router.put(
  "/qc/cs/inspeksiChemical/stop/:id",
  inspeksiChemical.stopInspeksiChemical
);

module.exports = router;
