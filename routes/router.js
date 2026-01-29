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
router.use("/", require("./masterdata/mtc/grupKodeAnalisisRoute"));

router.use("/", require("./mtc/spbStokSparepart"));
router.use("/", require("./mtc/spbServiceSparepartRoutes"));
router.use("/", require("./mtc/stokSparepartRoutes"));
router.use("/", require("./mtc/problemSparepartRoutes"));
router.use("/", require("./mtc/prosessMtcRoutes"));
router.use("/", require("./mtc/prosesMtcOs3Routes"));
router.use("/", require("./mtc/kpi/kpiActualRoute"));
router.use("/", require("./mtc/stokOpname/adjusmentRoute"));

//master data qc
router.use("/", require("./masterdata/qc/inspeksi/masterKodeDocRoute"));
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahCetakRoute"),
);
router.use("/", require("./masterdata/qc/inspeksi/masterKodeMasalahPondRoute"));
router.use("/", require("./masterdata/qc/inspeksi/masterKodeMasalahLemRoute"));
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahRabutRoute"),
);
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahCoatingRoute"),
);
router.use("/", require("./masterdata/qc/inspeksi/masterPointFinalRoute"));
router.use("/", require("./masterdata/qc/inspeksi/masterSubFinalRoute"));
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterPointOutsourcingBJRoute"),
);
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahCoatingRoute"),
);
router.use(
  "/",
  require("./masterdata/qc/inspeksi/masterKodeMasalahBarangRusak"),
);
router.use("/", require("./masterdata/qc/department/masterDepartmentRoutes"));
router.use(
  "/",
  require("./masterdata/qc/kalibrasiAlatUkur/masterStatusKalibrasiAlatUkurRoute"),
);
router.use(
  "/",
  require("./masterdata/qc/kalibrasiAlatUkur/masterLokasiKalibrasiAlatUkurRoute"),
);

//qc
router.use("/", require("./qc/inspeksi/bahan/inspeksiBahanRoutes"));
router.use("/", require("./qc/inspeksi/bahan/inspeksiBahanResultRoutes"));
router.use("/", require("./qc/inspeksi/chemical/inspeksiChemicalRoute"));
router.use("/", require("./qc/inspeksi/potong/inspeksiPotongRoutes"));
router.use("/", require("./qc/inspeksi/potong/inspeksiPotongResultRoutes"));
router.use("/", require("./qc/inspeksi/lipat/inspeksiLipatRoutes"));
router.use("/", require("./qc/inspeksi/lipat/inspeksiLipatResultRoutes"));
router.use("/", require("./qc/inspeksi/plate/inspeksiPraPlateRoutes"));
router.use("/", require("./qc/inspeksi/plate/inspeksiKelengkapanPlateRoutes"));
router.use("/", require("./qc/inspeksi/plate/inspeksiPrePressRoutes"));
router.use(
  "/",
  require("./qc/inspeksi/incomingOutsourcing/incomingOutsourcingRoutes"),
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
  require("./qc/inspeksi/barangRusak/inspeksiBarangRusakDefectRoutes"),
);

// qc barang rusak v2
router.use(
  "/",
  require("./qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Routes"),
);
router.use(
  "/",
  require("./qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Route"),
);

// qc final
router.use("/", require("./qc/inspeksi/final/inspeksiFinalRoutes"));

// qc kalibrasi alat ukur
router.use("/", require("./qc/kalibrasiAlatUkur/kalibrasiAlatUkurRoute"));
router.use("/", require("./qc/kalibrasiAlatUkur/kalibrasiAlatUkurTiketRoute"));

// qc outsourcing barang jadi
router.use(
  "/",
  require("./qc/inspeksi/outsourcingBJ/inspeksiOutsourcingBJRoutes"),
);

//qc ncr
router.use("/", require("./qc/ncr/ncrRoutes"));

//qc report
router.use("/", require("./qc/report/reportWasteRoute"));
router.use("/", require("./qc/report/reportRoute"));

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
router.use("/", require("./masterdata/hr/masterSPRoute"));

//HR
router.use("/", require("./hr/absenRoute"));
router.use("/", require("./hr/absenCheckInOutRoute"));
router.use("/", require("./hr/absenPayrollRoute"));
router.use("/", require("./hr/karyawan/karyawanRoute"));
router.use("/", require("./hr/karyawan/karyawanPotonganRoute"));
router.use("/", require("./hr/karyawan/karyawanDetailInformasiRoute"));
router.use("/", require("./hr/karyawan/karyawanDetailKeluargaRoute"));
router.use("/", require("./hr/karyawan/karyawanRiwayatPendidikanRoute"));
router.use("/", require("./hr/karyawan/karyawanRiwayatPekerjaanRoute"));
router.use("/", require("./hr/karyawan/karyawanBagianMesinRoute"));
router.use("/", require("./hr/pengajuanCuti/pengajuanCutiRoute"));
router.use("/", require("./hr/pengajuanIzin/pengajuanIzinRoute"));
router.use("/", require("./hr/pengajuanDinas/pengajuanDinasRoute"));
router.use("/", require("./hr/pengajuanKaryawan/pengajuanKaryawanRoute"));
router.use("/", require("./hr/pengajuanSP/pengajuanSPRoute"));
router.use("/", require("./hr/pengajuanSakit/pengajuanSakitRoute"));
router.use("/", require("./hr/pengajuanPinjaman/pengajuanPinjamanRoute"));
router.use("/", require("./hr/pengajuanLembur/pengajuanLemburRoute"));
router.use("/", require("./hr/pengajuanMangkir/pengajuanMangkirRoute"));
router.use("/", require("./hr/pengajuanTerlambat/pengajuanTerlambatRoute"));
router.use("/", require("./hr/pengajuanPulangCepat/pengajuanPulangCepatRoute"));
router.use(
  "/",
  require("./hr/pengajuanPromosiStatusKaryawan/pengajuanPromosiStatusKaryawanRoute"),
);
router.use("/", require("./hr/pengajuanPromosi/pengajuanPromosiRoute"));
router.use("/", require("./hr/jadwalKaryawan/jadwalKaryawanRoute"));
router.use("/", require("./hr/incomingTaskRoute"));
router.use(
  "/",
  require("./hr/outstanding/outstandingAbsen/outstandingAbsenRoute"),
);
router.use(
  "/",
  require("./hr/outstanding/outstandingKaryawan/outstandingKaryawanRoute"),
);
router.use("/", require("./hr/outstanding/outstandingIncomingRoute"));

//payroll
router.use("/", require("./hr/payroll/payrollRoute"));
router.use("/", require("./hr/payroll/payrollBayarRoute"));
router.use("/", require("./hr/payroll/payrollBayarBulananRoute"));

//kendala lkh
router.use("/", require("./kendalaLkh/kendalaLkhRoute"));
router.use("/", require("./kendalaLkh/kendalaLkhTiketRoute"));

//master ppic
router.use(
  "/",
  require("./masterdata/ppic/masterKategoriSettingKapasitasRoute"),
);
router.use("/", require("./masterdata/ppic/masterDryingTimeRoute"));
router.use("/", require("./masterdata/ppic/masterKapasitasMesinRoute"));
router.use("/", require("./masterdata/ppic/masterKapasitasJadwalKirimRoute"));

//ppic
router.use("/", require("./ppic/jadwalProduksiTiket/jadwalProduksiRoute"));
router.use(
  "/",
  require("./ppic/jadwalProduksiTiket/tiketPerubahanTanggalKirimRoute"),
);
router.use("/", require("./ppic/jadwalProduksi/jadwalProduksiViewRoute"));
router.use("/", require("./ppic/bookingJadwal/bookingJadwalRoute"));
router.use("/", require("./ppic/jadwalKirim/jadwalKirimRoute"));
router.use("/", require("./ppic/report/reportKapasitasRoute"));
router.use("/", require("./ppic/bom/bomRoute"));
router.use("/", require("./ppic/bomPpic/bomPpicRoute"));
router.use("/", require("./ppic/jobOrder/joRoute"));

//master data marketing
router.use("/", require("./masterdata/marketing/masterHargaPengirimanRoute"));
router.use("/", require("./masterdata/marketing/masterProdukRoute"));
router.use("/", require("./masterdata/marketing/masterCustomerRoute"));
router.use("/", require("./masterdata/marketing/masterMarketingRoute"));

//master barang
router.use("/", require("./masterdata/barang/masterBrandRoute"));
router.use("/", require("./masterdata/barang/masterUnitRoute"));
router.use("/", require("./masterdata/barang/masterBarangRoute"));

//master tahapan
router.use("/", require("./masterdata/tahapan/masterMesinTahapanRoute"));
router.use("/", require("./masterdata/tahapan/masterTahapanRoute"));
router.use("/", require("./masterdata/tahapan/masterTahapanMesinRoute"));

//master ketentuan insheet
router.use("/", require("./masterdata/masterKetentuanInsheetRoute"));

//master proses insheet
router.use("/", require("./masterdata/masterProsesInsheetRoute"));

//marketing
router.use("/", require("./marketing/kalkulasiRoute"));
router.use("/", require("./marketing/okpRoute"));
router.use("/", require("./marketing/ioRoute"));
router.use("/", require("./marketing/soRoute"));

//master jenis kertas
router.use("/", require("./masterdata/masterJenisKertasRoute"));

//master jenis tinta
router.use("/", require("./masterdata/masterJenisTintaRoute"));

//master jenis warna tinta
router.use("/", require("./masterdata/masterJenisWarnaTintaRoute"));

//master produksi
router.use(
  "/",
  require("./masterdata/kodeProduksi/masterKategoriKendalaRoute"),
);
router.use(
  "/",
  require("./masterdata/kodeProduksi/masterKriteriaKendalaRoute"),
);
router.use("/", require("./masterdata/kodeProduksi/masterWasteKendalaRoute"));
router.use("/", require("./masterdata/kodeProduksi/masterKodeProduksiRoute"));

//produksi
router.use("/", require("./produksi/produksiLkhRoute"));
router.use("/", require("./produksi/produksiLkhTahapanRoute"));
router.use("/", require("./produksi/produksiLkhProsesRoute"));
router.use("/", require("./produksi/produksiLkhWasteRoute"));
router.use("/", require("./produksi/produksiJoDoneRoute"));

//master kendaraan
router.use("/", require("./masterdata/kendaraan/masterKendaraanRoute"));

//delivery order
router.use("/", require("./deliveryOrder/deliveryOrderRoute"));
router.use("/", require("./deliveryOrder/deliveryOrderGroupRoute"));

//akunting
router.use("/", require("./akunting/deposit/depositRoute"));
router.use("/", require("./akunting/invoice/invoiceRoute"));
router.use("/", require("./akunting/retur/returRoute"));
router.use("/", require("./akunting/perubahanInvoice/perubahanInvoiceRoute"));

router.use("/", require("./uploadRoutes"));

module.exports = router;
