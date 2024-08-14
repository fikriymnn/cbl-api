const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiCoatingPeriodeResult = require("../../../../controller/qc/inspeksi/coating/inspeksiCoatingPeriodeResultController");
const inspeksiCoatingPeriode = require("../../../../controller/qc/inspeksi/coating/inspeksiCoatingPeriodeController");

// start result periode
router.get(
  "/qc/cs/inspeksiCoatingResult/periode/start/:id",auth,
  
  inspeksiCoatingPeriodeResult.startCoatingPeriodeResult
);

// stop result periode
router.put(
  "/qc/cs/inspeksiCoatingResult/periode/stop/:id",auth,
  
  inspeksiCoatingPeriodeResult.stopCoatingPeriodeResult
);

//submit coating periode
router.put("/qc/cs/inspeksiCoating/periode/:id",auth,inspeksiCoatingPeriode.updateInspeksiCoatingPeriode)

//add coating result periode id = inspeksi coating
router.post(
  "/qc/cs/inspeksiCoatingResult/periode/:id",auth,
  
  inspeksiCoatingPeriodeResult.addInspeksiCoatingPeriodeResult
);

//add coating point periode id = inspeksi coating result
// router.post(
//   "/qc/cs/inspeksiCoatingPoint/periode/:id",
  
//   inspeksiCoatingPeriodeResult.addInspeksiCoatingPeriodePoint
// );

module.exports = router;
