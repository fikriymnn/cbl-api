const router = require("express").Router();

router.use("/", require(".//notificationRoutes"));
router.use("/", require("./authRoutes"));
router.use("/", require("./userRoutes"));
router.use("/", require("./ticketRoutes"));
router.use("/", require("./ticketOs3Routes"));

//dashboard mtc
router.use("/", require("./mtc/DashboardMtc"));

//project mtc
router.use("/", require("./mtc/project/projectRoutes"));
router.use("/", require("./mtc/project/subProjectRoutes"));

//report mtc
router.use("/", require("./mtc/reportMtc"));

//pm
router.use("/", require("./mtc/preventive/inspectionPm1Routes"));
router.use("/", require("./mtc/preventive/inspentionPm2Routes"));
router.use("/", require("./mtc/preventive/inspentionPm3Routes"));

//master data
router.use("/", require("./masterdata/masterBagianRoutes"));
router.use("/", require("./masterdata/masterRoleRoutes"));

//master data maintenance
router.use("/", require("./masterdata/mtc/masterMesinRoute"));
router.use("/", require("./masterdata/mtc/masterSparepartRoute"));
router.use("/", require("./masterdata/mtc/masterTimeMonitoringRoute"));
router.use("/", require("./masterdata/mtc/masterKodeAnalisisRoute"));
router.use("/", require("./masterdata/mtc/masterSkorPerbaikanRoute"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm1Route"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm2Route"));
router.use("/", require("./masterdata/mtc/preventive/masterTaskPm3Route"));
router.use("/", require("./masterdata/mtc/kpi/masterKPIRoute"));
router.use("/", require("./masterdata/mtc/masterGradeRoute"));

//master data qc
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahCetakRoute")
);
router.use("/", require("./masterdata/qc/inspeksi/masterKodeMasalahPondRoute"));
router.use("/", require("./masterdata/qc/inspeksi/masterKodeMasalahLemRoute"));
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahRabutRoute")
);
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahCoatingRoute")
);
router.use("/", require("./masterdata/qc/inspeksi/masterPointFinalRoute"));
router.use("/", require("./masterdata/qc/inspeksi/masterSubFinalRoute"));
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterPointOutsourcingBJRoute")
);
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahCoatingRoute")
);
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahBarangRusak")
);
router.use("/", require("./masterdata/qc/department/masterDepartmentRoutes"));

router.use("/", require("./mtc/spbStokSparepart"));
router.use("/", require("./mtc/spbServiceSparepartRoutes"));
router.use("/", require("./mtc/stokSparepartRoutes"));
router.use("/", require("./mtc/problemSparepartRoutes"));
router.use("/", require("./mtc/prosessMtcRoutes"));
router.use("/", require("./mtc/prosesMtcOs3Routes"));
router.use("/", require("./mtc/kpi/kpiActualRoute"));

//qc
router.use("/", require("./qc/inspeksi/bahan/inspeksiBahanRoutes"));
router.use("/", require("./qc/inspeksi/bahan/inspeksiBahanResultRoutes"));
router.use("/", require("./qc/inspeksi/potong/inspeksiPotongRoutes"));
router.use("/", require("./qc/inspeksi/potong/inspeksiPotongResultRoutes"));
router.use("/", require("./qc/inspeksi/lipat/inspeksiLipatRoutes"));
router.use("/", require("./qc/inspeksi/lipat/inspeksiLipatResultRoutes"));
router.use("/", require("./qc/inspeksi/plate/inspeksiPraPlateRoutes"));
router.use("/", require("./qc/inspeksi/plate/inspeksiKelengkapanPlateRoutes"));
router.use("/", require("./qc/inspeksi/plate/inspeksiPrePressRoutes"));
router.use(
  "/",
  require("./qc/inspeksi/incomingOutsourcing/incomingOutsourcingRoutes")
);
router.use("/", require("./qc/ValidasiRoute"));

// qc cetak
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakRoutes"));
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakAwalRoutes"));
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakAwalPointRoutes"));
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakPeriodeRoutes"));
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakPeriodePointRoutes"));
router.use("/", require("./qc/inspeksi/cetak/inspeksiCetakPeriodeDefectRoute"));

// qc pond
router.use("/", require("./qc/inspeksi/pond/inspeksiPondRoutes"));
router.use("/", require("./qc/inspeksi/pond/inspeksiPondAwalRoutes"));
router.use("/", require("./qc/inspeksi/pond/inspeksiPondAwalPointRoutes"));
router.use("/", require("./qc/inspeksi/pond/inspeksiPondPeriodeRoutes"));
router.use("/", require("./qc/inspeksi/pond/inspeksiPondPeriodePointRoutes"));
router.use("/", require("./qc/inspeksi/pond/inspeksiPondPeriodeDefectRoute"));

// qc lem
router.use("/", require("./qc/inspeksi/lem/inspeksiLemRoutes"));
router.use("/", require("./qc/inspeksi/lem/inspeksiLemAwalRoutes"));
router.use("/", require("./qc/inspeksi/lem/inspeksiLemAwalPointRoutes"));
router.use("/", require("./qc/inspeksi/lem/inspeksiLemPeriodeRoutes"));
router.use("/", require("./qc/inspeksi/lem/inspeksiLemPeriodePointRoutes"));
router.use("/", require("./qc/inspeksi/lem/inspeksiLemPeriodeDefectRoute"));

// qc rabut
router.use("/", require("./qc/inspeksi/rabut/inspeksiRabutRoute"));
router.use("/", require("./qc/inspeksi/rabut/inspeksiRabutPointRoute"));

// ampar lem
router.use("/", require("./qc/inspeksi/amparLem/inspeksiAmparLemRoute"));
router.use("/", require("./qc/inspeksi/amparLem/inspeksiAmparLemPointRoute"));

// qc coating
router.use("/", require("./qc/inspeksi/coating/inspeksiCoatingRoutes"));
router.use("/", require("./qc/inspeksi/coating/inspeksiCoatingAwalRoutes"));
router.use("/", require("./qc/inspeksi/coating/inspeksiCoatingPeriodeRoutes"));

// qc barang rusak
router.use("/", require("./qc/inspeksi/barangRusak/inspeksiBarangRusakRoutes"));
router.use(
  "/",
  require("./qc/inspeksi/barangRusak/inspeksiBarangRusakDefectRoutes")
);

// qc final
router.use("/", require("./qc/inspeksi/final/inspeksiFinalRoutes"));

// qc outsourcing barang jadi
router.use(
  "/",
  require("./qc/inspeksi/outsourcingBJ/inspeksiOutsourcingBJRoutes")
);

//qc ncr
router.use("/", require("./qc/ncr/ncrRoutes"));

//qc report
router.use("/", require("./qc/report/reportWasteRoute"));

//capa
router.use("/", require("./qc/capa/capaRoutes"));

//HR master
router.use("/", require("./masterdata/hr/masterPerusahaanRoute"));
router.use("/", require("./masterdata/hr/masterShift/masterShiftRoute"));
router.use("/", require("./masterdata/hr/masterShift/masterIstirahatRoute"));
router.use("/", require("./masterdata/hr/masterCutiRoute"));
router.use("/", require("./masterdata/hr/masterCutiKhususRoute"));
router.use("/", require("./masterdata/hr/masterDivisiRoute"));
router.use("/", require("./masterdata/hr/masterJabatanRoute"));
router.use("/", require("./masterdata/hr/masterDepartmentRoute"));
router.use("/", require("./masterdata/hr/masterBagianHrRoute"));
router.use("/", require("./masterdata/hr/masterGradeRoute"));
router.use("/", require("./masterdata/hr/masterAbsensiRoute"));
router.use("/", require("./masterdata/hr/masterPayrollRoute"));
router.use("/", require("./masterdata/hr/masterStatusKaryawanRoute"));

//HR
router.use("/", require("./hr/absenRoute"));
router.use("/", require("./hr/absenCheckInOutRoute"));
router.use("/", require("./hr/absenPayrollRoute"));
router.use("/", require("./hr/karyawan/karyawanRoute"));
router.use("/", require("./hr/karyawan/karyawanPotonganRoute"));
router.use("/", require("./hr/karyawan/karyawanBagianMesinRoute"));
router.use("/", require("./hr/pengajuanCuti/pengajuanCutiRoute"));
router.use("/", require("./hr/pengajuanIzin/pengajuanIzinRoute"));
router.use("/", require("./hr/pengajuanSakit/pengajuanSakitRoute"));
router.use("/", require("./hr/pengajuanPinjaman/pengajuanPinjamanRoute"));
router.use("/", require("./hr/pengajuanLembur/pengajuanLemburRoute"));
router.use("/", require("./hr/pengajuanMangkir/pengajuanMangkirRoute"));
router.use(
  "/",
  require("./hr/pengajuanPromosiStatusKaryawan/pengajuanPromosiStatusKaryawanRoute")
);
router.use("/", require("./hr/jadwalKaryawan/jadwalKaryawanRoute"));
router.use("/", require("./hr/incomingTaskRoute"));
router.use(
  "/",
  require("./hr/outstanding/outstandingAbsen/outstandingAbsenRoute")
);
router.use(
  "/",
  require("./hr/outstanding/outstandingKaryawan/outstandingKaryawanRoute")
);

//payroll
router.use("/", require("./hr/payroll/payrollRoute"));
router.use("/", require("./hr/payroll/payrollBayarRoute"));

//kendala lkh
router.use("/", require("./kendalaLkh/kendalaLkhRoute"));
router.use("/", require("./kendalaLkh/kendalaLkhTiketRoute"));

//master ppic
router.use(
  "/",
  require("./masterdata/ppic/masterKategoriSettingKapasitasRoute")
);
router.use("/", require("./masterdata/ppic/masterDryingTimeRoute"));

//ppic
router.use("/", require("./ppic/jadwalProduksiRoute"));
router.use("/", require("./ppic/jadwalProduksi/jadwalProduksiViewRoute"));

router.use("/", require("./uploadRoutes"));

module.exports = router;
