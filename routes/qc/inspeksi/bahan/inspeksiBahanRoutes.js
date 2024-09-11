const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiBahan = require("../../../../controller/qc/inspeksi/bahan/inspeksiBahanController");

router.get("/qc/cs/inspeksiBahan/:id?", auth, inspeksiBahan.getInspeksiBahan);
router.post("/qc/cs/inspeksiBahan", inspeksiBahan.createInspeksiBahan);
router.delete("/qc/cs/inspeksiBahan/:id", inspeksiBahan.deleteInspeksiBahan);
//update
router.put(
  "/qc/cs/inspeksiBahan/update/:id",
  inspeksiBahan.updateInspeksiBahan
);
//start and stop
router.get(
  "/qc/cs/inspeksiBahan/start/:id",
  auth,
  inspeksiBahan.startInspeksiBahan
);
router.put("/qc/cs/inspeksiBahan/stop/:id", inspeksiBahan.stopInspeksiBahan);

module.exports = router;
