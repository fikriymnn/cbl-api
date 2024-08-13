const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCoatingAwalResult = require("../../../../controller/qc/inspeksi/coating/inspeksiCoatingAwalResultController");
const inspeksiCoatingAwal = require("../../../../controller/qc/inspeksi/coating/inspeksiCoatingAwalController");

router.put(
  "/qc/cs/inspeksiCoatingResult/start/:id",
  auth,
  inspeksiCoatingAwalResult.startCoatingAwalResult
);

router.put(
  "/qc/cs/inspeksiCoatingResult/stop/:id",
  auth,
  inspeksiCoatingAwalResult.stopCoatingAwalResult
);

module.exports = router;
