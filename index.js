const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/database");
const { Sequelize, DataTypes, Op } = require("sequelize");
const tc = require("./model/maintenaceTicketModel");
const tcDepartment = require("./model/maintenanceTicketDepartmentModel");
const tcos3 = require("./model/maintenanceTicketOs3Model");
const user = require("./model/userModel");
const master = require("./model/masterData/masterMesinModel");
const master2 = require("./model/masterData/masterSparepart");
const masterGrade = require("./model/masterData/mtc/masterGradeModel");
const mtcSparepartProblem = require("./model/mtc/sparepartProblem");
const mtcAction = require("./model/mtc/userActionMtc");
const stok = require("./model/mtc/stokSparepart");
const spbStok = require("./model/mtc/spbStokSparepart");
const spbService = require("./model/mtc/spbServiceSparepart");
const proses = require("./model/mtc/prosesMtc");
const prosesOs3 = require("./model/mtc/prosesMtcOs3");
const kode = require("./model/masterData/masterKodeAnalisisModel");
const msMonitor = require("./model/masterData/mtc/timeMonitoringModel");
const msSkor = require("./model/masterData/mtc/masterSkorJenisPerbaikanModel");
const mstaskm1 = require("./model/masterData/mtc/preventive/pm1/inspectionTaskPm1Model");
const mspointm1 = require("./model/masterData/mtc/preventive/pm1/inspenctionPoinPm1Model");
const mskpi = require("./model/masterData/mtc/kpi/masterKpiModel");
const kpiActual = require("./model/mtc/kpi/kpiActual");
const kpiTicket = require("./model/mtc/kpi/kpiTicket");
const KurangUmur = require("./model/mtc/kurangUmurMesinModel");
const adjusmentSparepart = require("./model/mtc/stokOpname/adjusmentSparepartModel");
const msMainGrupAnalisis = require("./model/masterData/mtc/grupKodeAnalisis/masterMainGrupKodeAnalisisModel");
const msChildGrupAnalisis = require("./model/masterData/mtc/grupKodeAnalisis/masterChildGrupKodeAnalisisModel");

const tcpm1 = require("./model/mtc/preventive/pm1/ticketPm1");
const pointpm1 = require("./model/mtc/preventive/pm1/pointPm1");
const taskpm1 = require("./model/mtc/preventive/pm1/taskPm1");

const tcpm1Man = require("./model/mtc/preventive/pm1Man/ticketPm1Man");
const pointpm1Man = require("./model/mtc/preventive/pm1Man/pointPm1Man");
const taskpm1Man = require("./model/mtc/preventive/pm1Man/taskPm1Man");

const msPointPm2 = require("./model/masterData/mtc/preventive/pm2/inspenctionPoinPm2Model");
const msTaskPm2 = require("./model/masterData/mtc/preventive/pm2/inspectionTaskPm2Model");

const tcpm2 = require("./model/mtc/preventive/pm2/ticketPm2");
const pointpm2 = require("./model/mtc/preventive/pm2/pointPm2");
const taskpm2 = require("./model/mtc/preventive/pm2/taskPm2");

const tcpm2Man = require("./model/mtc/preventive/pm2Man/ticketPm2Man");
const pointpm2Man = require("./model/mtc/preventive/pm2Man/pointPm2Man");
const taskpm2Man = require("./model/mtc/preventive/pm2Man/taskPm2Man");

const mspointpm3 = require("./model/masterData/mtc/preventive/pm3/inspenctionPoinPm3Model");
const mstaskpm3 = require("./model/masterData/mtc/preventive/pm3/inspectionTaskPm3Model");

const tcpm3 = require("./model/mtc/preventive/pm3/ticketPm3");
const pointpm3 = require("./model/mtc/preventive/pm3/pointPm3");
const taskpm3 = require("./model/mtc/preventive/pm3/taskPm3");

const tcpm3Man = require("./model/mtc/preventive/pm3Man/ticketPm3Man");
const pointpm3Man = require("./model/mtc/preventive/pm3Man/pointPm3Man");
const taskpm3Man = require("./model/mtc/preventive/pm3Man/taskPm3Man");

const notif = require("./model/notificationModel");

const inspeksiBahan = require("./model/qc/inspeksi/bahan/inspeksiBahanModel");
const inspeksiBahanResult = require("./model/qc/inspeksi/bahan/inspeksiBahanResultModel");

const inspeksiChemical = require("./model/qc/inspeksi/chemical/inspeksiChemicalModel");
const inspeksiChemicalPoint = require("./model/qc/inspeksi/chemical/inspeksiChemicalPointModel");

const inspeksiPotong = require("./model/qc/inspeksi/potong/inspeksiPotongModel");
const inspeksiPotongResult = require("./model/qc/inspeksi/potong/inspeksiPotongResultModel");

const inspeksiPrePress = require("./model/qc/inspeksi/plate/inspeksiPrePressModel");
const inspeksiPraPlate = require("./model/qc/inspeksi/plate/inspeksiPraPlateModel");
const inspeksiKelengkapanPlate = require("./model/qc/inspeksi/plate/inspeksiKelengkapanPlate");
const inspeksiPraPlateResult = require("./model/qc/inspeksi/plate/inspeksiPraPlateResultModel");

const inspeksiLipat = require("./model/qc/inspeksi/lipat/inspeksiLipatModel");
const inspeksiLipatPoint = require("./model/qc/inspeksi/lipat/inspeksiLipatPointModel");
const inspeksiLipatResult = require("./model/qc/inspeksi/lipat/inspeksiLipatResultModel");

const incomingOutsourcing = require("./model/qc/inspeksi/incomingOutsourcing/incomingOutsourcingModel");
const incomingOutsourcingResult = require("./model/qc/inspeksi/incomingOutsourcing/incomingOutsourcingResultModel");

const inspeksiCetak = require("./model/qc/inspeksi/cetak/inspeksiCetakModel");
const inspeksiCetakAwal = require("./model/qc/inspeksi/cetak/inspeksiCetakAwalModel");
const inspeksiCetakAwalPoint = require("./model/qc/inspeksi/cetak/inspeksiCetakAwalPointModel");
const inspeksiCetakPeriode = require("./model/qc/inspeksi/cetak/inspeksiCetakPeriodeModel");
const inspeksiCetakPeriodePoint = require("./model/qc/inspeksi/cetak/inspeksiCetakPeriodePointModel");
const inspeksiCetakPeriodeDefect = require("./model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectModel");
const inspeksiCetakPeriodeDefectDepartment = require("./model/qc/inspeksi/cetak/inspeksiCetakPeriodeDefectDeparmentMOdel");

const inspeksiPond = require("./model/qc/inspeksi/pond/inspeksiPondModel");
const inspeksiPondAwal = require("./model/qc/inspeksi/pond/inspeksiPondAwalModel");
const inspeksiPondAwalPoint = require("./model/qc/inspeksi/pond/inspeksiPondAwalPointModel");
const inspeksiPondPeriode = require("./model/qc/inspeksi/pond/inspeksiPondPeriodeModel");
const inspeksiPondPeriodePoint = require("./model/qc/inspeksi/pond/inspeksiPondPeriodePointModel");
const inspeksiPondPeriodeDefect = require("./model/qc/inspeksi/pond/inspeksiPondPeriodeDefectModel");
const inspeksiPondPeriodeDefectDepartment = require("./model/qc/inspeksi/pond/inspeksiPondPeriodeDefectDepartmentModel");

const inspeksiLem = require("./model/qc/inspeksi/lem/inspeksiLemModel");
const inspeksiLemAwal = require("./model/qc/inspeksi/lem/inspeksiLemAwalModel");
const inspeksiLemAwalPoint = require("./model/qc/inspeksi/lem/inspeksiLemAwalPointModel");
const inspeksiLemPeriode = require("./model/qc/inspeksi/lem/inspeksiLemPeriodeModel");
const inspeksiLemPeriodePoint = require("./model/qc/inspeksi/lem/inspeksiLemPeriodePointModel");
const inspeksiLemPeriodeDefect = require("./model/qc/inspeksi/lem/inspeksiLemPeriodeDefectModel");
const inspeksiLemPeriodeDefectDepartment = require("./model/qc/inspeksi/lem/inspeksiLemPeriodeDefectDepartmentModel");

const inspeksiRabut = require("./model/qc/inspeksi/rabut/inspeksiRabutModel");
const inspeksiRabutPoint = require("./model/qc/inspeksi/rabut/inspeksiRabutPointModel");
const inspeksiRabutDefect = require("./model/qc/inspeksi/rabut/inspeksiRabutDefectModel");
const inspeksiRabutDefectDepartment = require("./model/qc/inspeksi/rabut/inspeksiRabutPeriodeDefectDepartmentModel");

const inspeksiAmparLem = require("./model/qc/inspeksi/amparLem/inspeksiAmparLemModel");
const inspeksiAmparLemPoint = require("./model/qc/inspeksi/amparLem/inspeksiAmparLemPointModel");
const inspeksiAmparLemDefect = require("./model/qc/inspeksi/amparLem/inspeksiAmparLemDefectModel");
const inspeksiAmparLemDefectDepartment = require("./model/qc/inspeksi/amparLem/inspeksiAmparLemPeriodeDefectDepartmentModel");

const msCetakmasalah = require("./model/masterData/qc/inspeksi/masterKodeMasalahCetakModel");
const msPondmasalah = require("./model/masterData/qc/inspeksi/masterKodeMasalahPondModel");
const msLemmasalah = require("./model/masterData/qc/inspeksi/masterKodeMasalahLemModel");
const msSamplingRabutMasalah = require("./model/masterData/qc/inspeksi/masterKodeMasalahSamplingHasilRabutModel");
const msCoatingMasalah = require("./model/masterData/qc/inspeksi/masterKodeMasalahCoatingModel");
const msPointFinal = require("./model/masterData/qc/inspeksi/masterPointFinalModel");
const msSubFinal = require("./model/masterData/qc/inspeksi/masterSubFinalModel");
const msBarangRusakMasalah = require("./model/masterData/qc/inspeksi/masterKodeMasalahBarangRusak");
const msPointOutsourcingBJ = require("./model/masterData/qc/inspeksi/masterPointOutsourcingBJMode");
const msKodeDocInspeksi = require("./model/masterData/qc/inspeksi/masterKodeDocModel");
const msStatusKalibrasiAlatUkur = require("./model/masterData/qc/kalibrasiAlatUkur/masterStatusKalibrasiAlatUkurModel");
const msLokasiKalibrasiAlatUkur = require("./model/masterData/qc/kalibrasiAlatUkur/masterLokasiPenyimpananKalibrasiAlatUkurModel");

const msdepartmentCetak = require("./model/masterData/qc/department/departmentCetakModel");
const msdepartment = require("./model/masterData/qc/department/masterDepartmentModel");

const inspeksi_coating = require("./model/qc/inspeksi/coating/inspeksiCoatingModel");
const inspeksi_coating_sub_awal = require("./model/qc/inspeksi/coating/sub/inspeksiCoatingSubAwalModel");
const inspeksi_coating_sub_periode = require("./model/qc/inspeksi/coating/sub/inspeksiCoatingSubPeriodeModel");
const inspeksi_coating_result_awal = require("./model/qc/inspeksi/coating/result/inspeksiCoatingResultAwalModel");
const inspeksi_coating_result_periode = require("./model/qc/inspeksi/coating/result/inspeksiCoatingResultPeriodeModel");
const inspeksi_coating_point_periode = require("./model/qc/inspeksi/coating/inspeksiCoatingResultPointPeriodeModel");
const inspeksi_coating_point_periode_department = require("./model/qc/inspeksi/coating/inspeksiCoatingPeriodeDefectDeparmentMOdel");

const inspeksiFinal = require("./model/qc/inspeksi/final/inspeksiFinalModel");
const inspeksiFinalpoint = require("./model/qc/inspeksi/final/inspeksiFinalPoint");
const inspeksiFinalSub = require("./model/qc/inspeksi/final/inspeksiFinalSubModel");

const inspeksiOutsourcingBj = require("./model/qc/inspeksi/outsourcingBJ/inspeksiOutsourcingBJModel");
const inspeksiOutsourcingBJpoint = require("./model/qc/inspeksi/outsourcingBJ/inspeksiOutsourcingBjPoint");
const inspeksiOutsourcingBJSub = require("./model/qc/inspeksi/outsourcingBJ/inspeksiOutsourcingBjSubModel");

const inspeksiBarangRusak = require("./model/qc/inspeksi/barangRusak/inspeksiBarangRusakModel");
const inspeksiBarangRusakDefect = require("./model/qc/inspeksi/barangRusak/inspeksiBarangRusakDefectModel");

const inspeksiBarangRusakV2 = require("./model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakV2Model");
const inspeksiBarangRusakPointV2 = require("./model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakPointV2Model");
const inspeksiBarangRusakDefectV2 = require("./model/qc/inspeksi/barangRusakV2/inspeksiBarangRusakDefectV2Model");

const kalibrasiAlatUkur = require("./model/qc/kalibrasiAlatUkur/kalibrasiAlatUkurModel");
const kalibrasiAlatUkurTiket = require("./model/qc/kalibrasiAlatUkur/kalibrasiAlatUkurTiketModel");

const NcrTiket = require("./model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("./model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("./model/qc/ncr/ncrKetidaksesuaianModel");

const CapaTiket = require("./model/qc/capa/capaTiketmodel");
const CapaKetidaksesuaian = require("./model/qc/capa/capaKetidakSesuaianModel");

const masterBagian = require("./model/masterData/masterBagian");
const masterRole = require("./model/masterData/masterRoleModel");
const masterAkses = require("./model/masterData/masterAkses/masterAksesModel");

//master hr
const masterPerusahaan = require("./model/masterData/hr/masterPerusahaanModel");
const masterCuti = require("./model/masterData/hr/masterCutiModel");
const masterDivisi = require("./model/masterData/hr/masterDivisiModel");
const masterDepartment = require("./model/masterData/hr/masterDeprtmentModel");
const masterBagianHr = require("./model/masterData/hr/masterBagianModel");
const masterJabatan = require("./model/masterData/hr/masterJabatanModel");
const masterCutiKhusus = require("./model/masterData/hr/masterCutiKhususModel");
const masterGradeHr = require("./model/masterData/hr/masterGradeModel");
const masterAbsensi = require("./model/masterData/hr/masterAbsensiModel");
const WaktuShift = require("./model/masterData/hr/masterShift/masterShiftModel");
const WaktuIstirahat = require("./model/masterData/hr/masterShift/masterIstirahatModel");
const masterPayroll = require("./model/masterData/hr/masterPayrollModel");
const masterStatusKaryawan = require("./model/masterData/hr/masterStatusKaryawanModel");
const masterSP = require("./model/masterData/hr/masterSPModel");

// absen hr
const absenModel = require("./model/hr/absenModel");
const outstandingAbsen = require("./model/hr/outstanding/outstandingAbsen/outstandingAbsenModel");
const outstandingKaryawan = require("./model/hr/outstanding/outstandingKaryawan/outstandingKaryawanModel");

//karyawan
const karyawanBiodata = require("./model/hr/karyawan/karyawanBiodataModel");
const karyawanPotongan = require("./model/hr/karyawan/karyawanPotonganModel");
const KaryawanBagianMesin = require("./model/hr/karyawan/karyawanBagianMesinModel");
const karyawanDetailInformasi = require("./model/hr/karyawan/karyawanDetailInformasiModel");
const karyawanDetailKeluarga = require("./model/hr/karyawan/karyawanDetailKeluargaModel");
const karyawanRiwayatPendidikan = require("./model/hr/karyawan/karyawanRiwayatPendidikanModel");
const karyawanRiwayatPekerjaan = require("./model/hr/karyawan/karyawanRiwayatPekerjaanModel");
//jadwal
const jadwalKaryawan = require("./model/hr/jadwalKaryawan/jadwalKaryawanModel");
//pengajuan
const pengajuanCuti = require("./model/hr/pengajuanCuti/pengajuanCutiModel");
const pengajuanIzin = require("./model/hr/pengajuanIzin/pengajuanIzinModel");
const pengajuanDinas = require("./model/hr/pengajuanDinas/pengajuanDinasModel");
const pengajuanSP = require("./model/hr/pengajuanSP/pengajuanSPModel");
const pengajuanSakit = require("./model/hr/pengajuanSakit/pengajuanSakitModel");
const pengajuanKaryawan = require("./model/hr/pengajuanKaryawan/pengajuanKaryawanModel");
const pengajuanPinjaman = require("./model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const pengajuanLembur = require("./model/hr/pengajuanLembur/pengajuanLemburModel");
const pengajuanMangkir = require("./model/hr/pengajuanMangkir/pengajuanMangkirModel");
const pengajuanTerlambat = require("./model/hr/pengajuanTerlambat/pengajuanTerlambatModel");
const pengajuanPulangCepat = require("./model/hr/pengajuanPulangCepat/pengajuanPulangCepatModel");
const pengajuanPromosiStatusKaryawan = require("./model/hr/pengajuanPromosiStatusKaryawan/pengajuanPromosiStatusKaryawanModel");
const pengajuanPromosiStatusKaryawanPenilaian = require("./model/hr/pengajuanPromosiStatusKaryawan/pengajuanPromosiStatusKaryawanPenilaianModel");
const historiPengajuanPromosiStatusKaryawan = require("./model/hr/pengajuanPromosiStatusKaryawan/hisroryPromosiStatusKaryawanModel");
const pengajuanPromosiKaryawan = require("./model/hr/pengajuanPromosi/pengajuanPromosiModel");
const pengajuanPromosiKaryawanHistori = require("./model/hr/pengajuanPromosi/pengajuanPromosiHistoryModel");

//kendala lkh
const kendalaLkh = require("./model/kendalaLkh/kendalaLkhModel");
const KendalaLkhDepartment = require("./model/kendalaLkh/kendalaLkhDepartmentModel");
const KendalaLkhTiket = require("./model/kendalaLkh/kendalaLkhTiketModel");

//project mtc
const Project = require("./model/mtc/project/projectModel");
const SubProject = require("./model/mtc/project/subProjectModel");

//payroll
const payrollMingguanPeriode = require("./model/hr/payroll/payrollMingguanPeriodeModel");
const payrollMingguan = require("./model/hr/payroll/payrollMingguanModel");
const payrollMingguanDetail = require("./model/hr/payroll/payrollMingguanDetailModel");
const payrollBulananPeriode = require("./model/hr/payroll/payrollBulananPeriodeModel");
const payrollBulanan = require("./model/hr/payroll/payrollBulananModel");
const payrollBulananDetail = require("./model/hr/payroll/payrollBulananDetailModel");

//master ppic
const MasterKategoriSettingKapasitas = require("./model/masterData/ppic/masterKategoriSettingKapasitasModel");
const MasterDryingTime = require("./model/masterData/ppic/masterDryingTimeModel");
const MasterKapasitasMesin = require("./model/masterData/ppic/masterKapasitasMesinModel");
const MasterKapasitasJadwalKirim = require("./model/masterData/ppic/kapasitasJadwalKirim/masterKapasitasJadwalKirimModel");
const MasterKapasitasJadwalKirimArmada = require("./model/masterData/ppic/kapasitasJadwalKirim/masterKapasitasJadwalKirimArmadaModel");

//ppic
const JadwalProduksi = require("./model/ppic/jadwalProduksi/jadwalProduksiModel");
const JadwalProduksiLembur = require("./model/ppic/jadwalProduksi/jadwalLemburModel");
const TiketJadwalProduksi = require("./model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiModel");
const TiketJadwalProduksiTahapan = require("./model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiTahapanModel");
const TiketJadwalProduksiPerJam = require("./model/ppic/jadwalProduksiCalculateModel/tiketJadwalProduksiPerJamModel");
const TiketPerubahanJadwalKirim = require("./model/ppic/jadwalProduksiCalculateModel/tiketPerubahanTanggalKirimModel");
const BookingJadwal = require("./model/ppic/bookingJadwal/bookingJadwalModel");

//hak akses
const MasterRole = require("./model/masterData/masterRoleModel");
const MasterAksesMain = require("./model/masterData/masterAkses/masterAksesModel");
const MasterAksesParent1 = require("./model/masterData/masterAkses/masterAksesParent1Model");
const MasterAksesParent2 = require("./model/masterData/masterAkses/masterAksesParent2Model");
const MasterAksesParent3 = require("./model/masterData/masterAkses/masterAksesParent3Model");
const MasterAksesParent4 = require("./model/masterData/masterAkses/masterAksesParent4Model");

//master marketing
const MasterHargaPengiriman = require("./model/masterData/marketing/masterHargaPengirimanModel");
const MasterProduk = require("./model/masterData/marketing/masterProdukModel");
const MasterCustomer = require("./model/masterData/marketing/masterCustomerModel");
const MasterCustomerGudang = require("./model/masterData/marketing/masterCustomerGudangModel");
const MasterMarketing = require("./model/masterData/marketing/masterMarketingModel");

//master barang
const MasterUnit = require("./model/masterData/barang/masterUnitModel");
const MasterBrand = require("./model/masterData/barang/masterBrandModel");
const MasterBarang = require("./model/masterData/barang/masterBarangModel");

//master tahapan
const MasterMesinTahapan = require("./model/masterData/tahapan/masterMesinTahapanModel");
const MasterTahapan = require("./model/masterData/tahapan/masterTahapanModel");
const MasterTahapanMesin = require("./model/masterData/tahapan/masterTahapanMesinModel");

//master jenis
const MasterJenisKertas = require("./model/masterData/masterJenisKertasModel");
const MasterJenisTinta = require("./model/masterData/masterJenisTintaModel");
const MasterJenisWarnaTinta = require("./model/masterData/masterJenisWarnaTintaModel");

//master ketentuan insheet
const MasterKetentuanInsheet = require("./model/masterData/masterKetentuanInsheetModel");

//master proses insheet
const MasterProsesInsheet = require("./model/masterData/masterProsesInsheetModel");

//kalkulasi
const Kalkulasi = require("./model/marketing/kalkulasi/kalkulasiModel");
const KalkulasiQty = require("./model/marketing/kalkulasi/kalkulasiQtyModel");
const KalkulasiLainLain = require("./model/marketing/kalkulasi/kalkulasiLainLainModel");
const KalkulasiUserAction = require("./model/marketing/kalkulasi/kalkulasiUserActionModel");

//okp
const Okp = require("./model/marketing/okp/okpModel");
const OkpProses = require("./model/marketing/okp/okpProsesModel");
const OkpUserAction = require("./model/marketing/okp/okpUserActionModel");

//io
const Io = require("./model/marketing/io/ioModel");
const IoMounting = require("./model/marketing/io/ioMountingModel");
const IoTahapan = require("./model/marketing/io/ioTahapanModel");
const IoMountingLainLain = require("./model/marketing/io/ioMountingLainLain");
const IoUserAction = require("./model/marketing/io/ioActionActionModel");

//so
const So = require("./model/marketing/so/soModel");
const SoUserAction = require("./model/marketing/so/soUserActionModel");
const soPerubahanTglKirim = require("./model/marketing/so/soPerubahanTanggalKirimModel");
const soPerubahanHarga = require("./model/marketing/so/soPerubahanHargaModel");

//bom
const BomModel = require("./model/ppic/bom/bomModel");
const BomMounting = require("./model/ppic/bom/bomMountingModel");
const BomKertas = require("./model/ppic/bom/bomKertasModel");
const BomPoliban = require("./model/ppic/bom/bomPolibanModel");
const BomLem = require("./model/ppic/bom/bomLemModel");
const BomCorrugated = require("./model/ppic/bom/bomCorrugatedModel");
const BomCoating = require("./model/ppic/bom/bomCoatingModel");
const BomTinta = require("./model/ppic/bom/bomTintaModel");
const BomTintaDetail = require("./model/ppic/bom/bomTintaDetailModel");
const BomLainLain = require("./model/ppic/bom/bomLainLainModel");
const BomUserAction = require("./model/ppic/bom/bomUserActionModel");

//bom ppic
const BomPpicModel = require("./model/ppic/bomPpic/bomPpicModel");
const BomPpicKertas = require("./model/ppic/bomPpic/bomPpicKertasModel");
const BomPpicPoliban = require("./model/ppic/bomPpic/bomPpicPolibanModel");
const BomPpicLem = require("./model/ppic/bomPpic/bomPpicLemModel");
const BomPpicCorrugated = require("./model/ppic/bomPpic/bomPpicCorrugatedModel");
const BomPpicCoating = require("./model/ppic/bomPpic/bomPpicCoatingModel");
const BomPpicTinta = require("./model/ppic/bomPpic/bomPpicTintaModel");
const BomPpicTintaDetail = require("./model/ppic/bomPpic/bomPpicTintaDetailModel");
const BomPpicUserAction = require("./model/ppic/bomPpic/bomPpicUserActionModel");
const BomPpicLainLain = require("./model/ppic/bomPpic/bomPpicLainLainModel");

//jo
const JobOrderModel = require("./model/ppic/jobOrder/jobOrderModel");
const JobOrderMountingModel = require("./model/ppic/jobOrder/joMountingModel");
const JobOrderUserAction = require("./model/ppic/jobOrder/joUserActionModel");

//master produksi
const MasterKategoriKendala = require("./model/masterData/kodeProduksi/masterKategoriKendalaModel");
const MasterKriteriaKendala = require("./model/masterData/kodeProduksi/masterKriteriaKendalaModel");
const MasterKodeProduksi = require("./model/masterData/kodeProduksi/masterKodeProduksiModel");
const MasterWasteKendala = require("./model/masterData/kodeProduksi/masterWasteKendalaModel");

//produksi
const ProduksiLkhTahapan = require("./model/produksi/produksiLkhTahapanModel");
const ProduksiLkh = require("./model/produksi/produksiLkhModel");
const ProduksiLkhProses = require("./model/produksi/produksiLkhProsesModel");
const ProduksiJoDone = require("./model/produksi/produksiJoDoneModel");

//delivery Order
const DeliveryOrderGroup = require("./model/deliveryOrder/deliveryOrderGroupModel");
const DeliveryOrder = require("./model/deliveryOrder/deliveryOrderModel");

//master kendaraan
const MasterKendaraan = require("./model/masterData/kendaraan/masterKendaraanModel");

//akunting
const Deposit = require("./model/akunting/deposit/depositModel");
const Invoice = require("./model/akunting/invoice/invoiceModel");
const InvoiceProduk = require("./model/akunting/invoice/invoiceProdukModel");
const Retur = require("./model/akunting/retur/returModel");
const ReturProduk = require("./model/akunting/retur/returProdukModel");
const PerubahanInvoice = require("./model/akunting/perubahanInvoice/perubahanInvoiceModel");
const PerubahanInvoiceProduk = require("./model/akunting/perubahanInvoice/perubahanInvoiceProdukModel");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");

dotenv.config();
const path = require("path");
const app = express();

// database sync to table
// (async () => {
//   await db.sync({ alter: true });
// })();

// model sync to table (pancingan)
// (async () => {
//   await soPerubahanHarga.sync({
//     alter: true,
//     logging: console.log,
//   });
// })();

// const ip100 = 75
// const ip50from = 74
// const ip50to = 60
// const ip0 = 59
// const actual = 43
// const reverse = true
// var nilai

// if(reverse){
//   if(actual<=ip100){
//     nilai= 100
//   }else if(actual>=ip50from&&actual<=ip50to){
//     nilai= 50
//   }else if(actual>=ip0){
//     nilai = 0
//   }
//   console.log(nilai)
// }else{
//   if(actual>=ip100){
//     nilai= 100
//   }else if(actual<=ip50from&&actual>=ip50to){
//     nilai= 50
//   }else if(actual<=ip0){
//     nilai = 0
//   }
//   console.log(nilai)
// }

const allowedOrigins = [
  "https://erp.cbloffset.com",
  "http://localhost:5173",
  "https://dtc.my.id",
];

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept",
  );
  next();
});

// Atur limit payload lebih besar (misalnya 50MB)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
  req.setTimeout(50000, () => {
    // 30000 ms = 30 detik
    res.status(408).send("Request Timeout");
  });
  next();
});

app.use(
  cors({
    credentials: true,
    origin: true,
  }),
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.set("trust proxy", true);

app.use(cookieParser());
app.get("/", (req, res) => {
  db.authenticate()
    .then(() => {
      res.json({ msg: "Connection has been established successfully." });
    })
    .catch((error) => {
      res.json({ msg: error });
    });
});

app.use("/", require("./routes/router"));

app.use("/images", express.static(path.join(__dirname, "./file")));

app.listen(process.env.APP_PORT, async () => {
  console.log("server up and running on port " + process.env.APP_PORT);
});

module.exports = app;
