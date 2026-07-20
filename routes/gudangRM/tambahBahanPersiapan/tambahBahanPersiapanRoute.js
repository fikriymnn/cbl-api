const router = require("express").Router();
const TambahBahanPersiapanController = require("../../../controller/gudangRM/tambahBahanPersiapan/tambahBahanPersiapanController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/gudangRM/tambahBahanPersiapan/:id?",
  auth,
  TambahBahanPersiapanController.getTambahBahanPersiapan
);

router.post(
  "/gudangRM/tambahBahanPersiapan",
  auth,
  TambahBahanPersiapanController.createTambahBahanPersiapan
);

router.put(
  "/gudangRM/tambahBahanPersiapan/:id",
  auth,
  TambahBahanPersiapanController.editTambahBahanPersiapan
);

router.put(
  "/gudangRM/tambahBahanPersiapan/approveQc/:id",
  auth,
  TambahBahanPersiapanController.approveQcTambahBahanPersiapan
);

router.put(
  "/gudangRM/tambahBahanPersiapan/approveGudang/:id",
  auth,
  TambahBahanPersiapanController.approveGudangTambahBahanPersiapan
);

router.put(
  "/gudangRM/tambahBahanPersiapan/rejectQc/:id",
  auth,
  TambahBahanPersiapanController.rejectQcTambahBahanPersiapan
);

router.put(
  "/gudangRM/tambahBahanPersiapan/rejectGudang/:id",
  auth,
  TambahBahanPersiapanController.rejectGudangTambahBahanPersiapan
);

router.put(
  "/gudangRM/tambahBahanPersiapan/pakaiTambahBahan/:id",
  auth,
  TambahBahanPersiapanController.pakaiTambahBahanTambahBahanPersiapan
);

router.put(
  "/gudangRM/tambahBahanPersiapan/approveQcPemakaian/:id",
  auth,
  TambahBahanPersiapanController.approveQcPemakaianTambahBahanPersiapan
);

router.delete(
  "/gudangRM/tambahBahanPersiapan/:id",
  auth,
  TambahBahanPersiapanController.deleteTambahBahanPersiapan
);

module.exports = router;
