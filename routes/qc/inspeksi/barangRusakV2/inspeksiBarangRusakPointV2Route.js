const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiBarangRusakPointV2 = require("../../../../controller/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Controller");
const inspeksiBarangRusakDefectV2 = require("../../../../controller/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Controller");

router.put(
  "/qc/cs/inspeksiBarangRusakPointV2/start/:id",
  auth,
  inspeksiBarangRusakPointV2.startBarangRusakV2Point
);

router.put(
  "/qc/cs/inspeksiBarangRusakPointV2/stop/:id",
  auth,
  inspeksiBarangRusakPointV2.stopBarangRusakV2Point
);

router.post(
  "/qc/cs/inspeksiBarangRusakPointV2/create",
  auth,
  inspeksiBarangRusakPointV2.createInspeksiBarangRusakPointV2
);
router.put(
  "/qc/cs/inspeksiBarangRusakPointV2/edit/:id",
  auth,
  inspeksiBarangRusakPointV2.updateInspeksiBarangRusakPointV2
);
router.put(
  "/qc/cs/inspeksiBarangRusakPointV2/istirahat/:id",
  auth,
  inspeksiBarangRusakPointV2.istirahatBarangRusakPointV2
);
router.put(
  "/qc/cs/inspeksiBarangRusakPointV2/istirahatMasuk/:id",
  auth,
  inspeksiBarangRusakPointV2.istirahatMasukBarangRusakPointV2
);

router.post(
  "/qc/cs/inspeksiBarangRusakPointV2/createDefect",
  auth,
  inspeksiBarangRusakDefectV2.addInspeksiBarangRusakDefectV2V2
);
router.put(
  "/qc/cs/inspeksiBarangRusakPointV2/simpanDefect/:id",
  auth,
  inspeksiBarangRusakDefectV2.simpanBarangRusakDefectV2
);

module.exports = router;
