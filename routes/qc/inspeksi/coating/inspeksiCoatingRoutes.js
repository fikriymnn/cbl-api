const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCoatingAwalController = require("../../../../controller/qc/inspeksi/coating/inspeksiCoatingAwalController");

router.get(
  "/qc/cs/inspeksiCoating/:id?",
  auth,
  inspeksiCoatingAwalController.getInspeksiCoating
);

router.post("/qc/cs/inspeksiCoating",auth,inspeksiCoatingAwalController.addInspeksiCoatingAwal)

router.put("/qc/cs/inspeksiCoating/:id",auth,inspeksiCoatingAwalController.updateInspeksiCoatingAwal)

module.exports = router;
