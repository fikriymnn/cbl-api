const router = require("express").Router();
const TambahBahanPemakaianController = require("../../../controller/gudangRM/tambahBahanPemakaian/tambahBahanPemakaianController");
const { auth } = require("../../../middlewares/authMiddlewares");

router.get(
  "/gudangRM/tambahBahanPemakaian/:id?",
  auth,
  TambahBahanPemakaianController.getTambahBahanPemakaian,
);

router.post(
  "/gudangRM/tambahBahanPemakaian",
  auth,
  TambahBahanPemakaianController.createTambahBahanPemakaian,
);

router.put(
  "/gudangRM/tambahBahanPemakaian/:id",
  auth,
  TambahBahanPemakaianController.editTambahBahanPemakaian,
);

router.put(
  "/gudangRM/tambahBahanPemakaian/approveQc/:id",
  auth,
  TambahBahanPemakaianController.approveQcTambahBahanPemakaian,
);

router.put(
  "/gudangRM/tambahBahanPemakaian/approveGudang/:id",
  auth,
  TambahBahanPemakaianController.approveGudangTambahBahanPemakaian,
);

router.put(
  "/gudangRM/tambahBahanPemakaian/rejectQc/:id",
  auth,
  TambahBahanPemakaianController.rejectQcTambahBahanPemakaian,
);

router.put(
  "/gudangRM/tambahBahanPemakaian/rejectGudang/:id",
  auth,
  TambahBahanPemakaianController.rejectGudangTambahBahanPemakaian,
);

router.delete(
  "/gudangRM/tambahBahanPemakaian/:id",
  auth,
  TambahBahanPemakaianController.deleteTambahBahanPemakaian,
);

module.exports = router;
