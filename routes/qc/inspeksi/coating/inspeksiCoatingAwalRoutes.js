const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCoatingAwalResult = require("../../../../controller/qc/inspeksi/coating/inspeksiCoatingAwalResultController");
const inspeksiCoatingAwal = require("../../../../controller/qc/inspeksi/coating/inspeksiCoatingAwalController");

// start result awal
router.get(
  "/qc/cs/inspeksiCoatingResult/awal/start/:id",auth,

  inspeksiCoatingAwalResult.startCoatingAwalResult
);

// stop result awal
router.put(
  "/qc/cs/inspeksiCoatingResult/awal/stop/:id"
,auth,
  inspeksiCoatingAwalResult.stopCoatingAwalResult
);

//submit coating awal
router.put("/qc/cs/inspeksiCoating/awal/:id",auth,inspeksiCoatingAwal.updateInspeksiCoatingAwal)

//add coating result awal id=inspeksi coating
router.post(
  "/qc/cs/inspeksiCoatingResult/awal/:id"
,auth,
  inspeksiCoatingAwalResult.addInspeksiCoatingAwalResult
);

module.exports = router;
