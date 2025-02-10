const router = require("express").Router();
const { auth } = require("../../../../middlewares/authMiddlewares");
const inspeksiBarangrusak = require("../../../../controller/qc/inspeksi/barangRusak/inspeksiBarangRusakController");

router.get(
  "/qc/cs/inspeksiBarangrusak/:id?",
  auth,
  inspeksiBarangrusak.getInspeksiBarangRusak
);
// router.post(
//   "/qc/cs/inspeksiBarangrusak",
//   inspeksiBarangrusak.createInspeksiBarangRusak
// );

router.put(
  "/qc/cs/inspeksiBarangrusak/start/:id",
  auth,
  inspeksiBarangrusak.startBarangRusak
);

router.put(
  "/qc/cs/inspeksiBarangrusak/done/:id",
  auth,
  inspeksiBarangrusak.doneBarangRusak
);

router.put(
  "/qc/cs/inspeksiBarangrusak/istirahat/:id",
  auth,
  inspeksiBarangrusak.istirahatBarangRusak
);

router.put(
  "/qc/cs/inspeksiBarangrusak/istirahatMasuk/:id",
  auth,
  inspeksiBarangrusak.masukIstirahatBarangRusak
);

module.exports = router;
