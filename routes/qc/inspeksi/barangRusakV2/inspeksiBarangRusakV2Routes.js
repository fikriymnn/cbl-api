const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiBarangrusakV2 = require("../../../../controller/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Controller");

router.get(
  "/qc/cs/inspeksiBarangRusakV2/:id?",
  inspeksiBarangrusakV2.getInspeksiBarangRusakV2
);
router.post(
  "/qc/cs/inspeksiBarangrusak",
  inspeksiBarangrusakV2.createInspeksiBarangRusakV2
);

router.put(
  "/qc/cs/inspeksiBarangRusakV2/start/:id",
  auth,
  inspeksiBarangrusakV2.startBarangRusak
);

router.put(
  "/qc/cs/inspeksiBarangRusakV2/done/:id",
  auth,
  inspeksiBarangrusakV2.doneBarangRusak
);

router.put(
  "/qc/cs/inspeksiBarangRusakV2/istirahat/:id",
  auth,
  inspeksiBarangrusakV2.istirahatBarangRusak
);

router.put(
  "/qc/cs/inspeksiBarangRusakV2/istirahatMasuk/:id",
  auth,
  inspeksiBarangrusakV2.masukIstirahatBarangRusak
);

module.exports = router;
