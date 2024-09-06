const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCoatingAwalController = require("../../../../controller/qc/inspeksi/coating/inspeksiCoatingAwalController");

//?jenis_prosess=awal
router.get(
  "/qc/cs/inspeksiCoating/:id?",auth,

  inspeksiCoatingAwalController.getInspeksiCoating
);

router.get(
  "/qc/cs/inspeksiCoating/group/:id",auth,

  inspeksiCoatingAwalController.getInspeksiCoatingJenisProsess
);

router.post("/qc/cs/inspeksiCoating",inspeksiCoatingAwalController.addInspeksiCoatingAwal)

router.get(
  "/qc/cs/inspeksiCoating/pending/:id",auth,
  inspeksiCoatingAwalController.pendingInspeksiCoating
);

router.get(
  "/qc/cs/inspeksiCoating/incoming/:id",auth,
  inspeksiCoatingAwalController.incomingInspeksiCoating
);
module.exports = router;
