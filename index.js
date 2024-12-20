const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/database");
const dbFinger = require("./config/databaseFinger");
const tc = require("./model/maintenaceTicketModel");
const tcos3 = require("./model/maintenanceTicketOs3Model");
const user = require("./model/userModel");
const master = require("./model/masterData/masterMesinModel");
const master2 = require("./model/masterData/masterSparepart");
const masterGrade = require("./model/masterData/mtc/masterGradeModel");
const mtc = require("./model/mtc/sparepartProblem");
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

const NcrTiket = require("./model/qc/ncr/ncrTicketModel");
const NcrDepartment = require("./model/qc/ncr/ncrDepartmentModel");
const NcrKetidaksesuain = require("./model/qc/ncr/ncrKetidaksesuaianModel");

const CapaTiket = require("./model/qc/capa/capaTiketmodel");
const CapaKetidaksesuaian = require("./model/qc/capa/capaKetidakSesuaianModel");

const masterBagian = require("./model/masterData/masterBagian");
const masterRole = require("./model/masterData/masterRoleModel");
const masterAkses = require("./model/masterData/masterAksesModel");

//master hr
const masterPerusahaan = require("./model/masterData/hr/masterPerusahaanModel");
const masterCuti = require("./model/masterData/hr/masterCutiModel");
const masterDivisi = require("./model/masterData/hr/masterDivisiModel");
const masterDepartment = require("./model/masterData/hr/masterDeprtmentModel");
const masterBagianHr = require("./model/masterData/hr/masterBagianModel");
const masterCutiKhusus = require("./model/masterData/hr/masterCutiKhususModel");
const masterGradeHr = require("./model/masterData/hr/masterGradeModel");
const masterAbsensi = require("./model/masterData/hr/masterAbsensiModel");
const WaktuIstirahat = require("./model/masterData/hr/masterShift/masterIstirahatModel");
const masterPayroll = require("./model/masterData/hr/masterPayrollModel");

// absen hr
const absenModel = require("./model/hr/absenModel");

//karyawan
const karyawanBiodata = require("./model/hr/karyawan/karyawanBiodataModel");

//jadwal
const jadwalKaryawan = require("./model/hr/jadwalKaryawan/jadwalKaryawanModel");
//pengajuan
const pengajuanCuti = require("./model/hr/pengajuanCuti/pengajuanCutiModel");
const pengajuanIzin = require("./model/hr/pengajuanIzin/pengajuanIzinModel");
const pengajuanSakit = require("./model/hr/pengajuanSakit/pengajuanSakitModel");
const pengajuanPinjaman = require("./model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const pengajuanLembur = require("./model/hr/pengajuanLembur/pengajuanLemburModel");
const pengajuanMangkir = require("./model/hr/pengajuanMangkir/pengajuanMangkirModel");

//kendala lkh
const kendalaLkh = require("./model/kendalaLkh/kendalaLkhModel");
const KendalaLkhDepartment = require("./model/kendalaLkh/kendalaLkhDepartmentModel");
const KendalaLkhTiket = require("./model/kendalaLkh/kendalaLkhTiketModel");

//payroll
const payrollMingguan = require("./model/hr/payroll/payrollMingguanModel");
const payrollMingguanDetail = require("./model/hr/payroll/payrollMingguanDetailModel");
const payrollBulanan = require("./model/hr/payroll/payrollBulananModel");
const payrollBulananDetail = require("./model/hr/payroll/payrollBulananDetailModel");

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const path = require("path");

const app = express();

// database sync to table
// (async () => {
//   await db.sync({ alter: true });
// })();

// model sync to table (pancingan)
// (async () => {
//   await inspeksiBahan.sync({ alter: true });
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
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

app.use(
  cors({
    credentials: true,
    origin: true,
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
