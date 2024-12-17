const { getAbsensiFunction } = require("../../../helper/absenFunction");
const Karyawan = require("../../../model/hr/karyawanModel");
const PengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const MasterGradeHr = require("../../../model/masterData/hr/masterGradeModel");
const MasterPayroll = require("../../../model/masterData/hr/masterPayrollModel");
const pengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const { Op, fn, col, literal, Sequelize } = require("sequelize");

const payrollController = {
  getPayroll: async (req, res) => {
    const { id_karyawan, startDate, endDate } = req.query;

    let obj = {};
    if (id_karyawan) obj.id_karyawan = id_karyawan;

    try {
      const pengajuanLemburData = await pengajuanLembur.findAll({
        include: [
          {
            model: Karyawan,
            as: "karyawan",
          },
          {
            model: Karyawan,
            as: "karyawan_pengaju",
            include: [
              {
                model: KaryawanBiodata,
                as: "biodata_karyawan",
                include: [
                  // {
                  //   model: MasterDivisi,
                  //   as: "divisi",
                  // },
                  {
                    model: MasterDepartment,
                    as: "department",
                  },
                  // {
                  //   model: MasterBagianHr,
                  //   as: "bagian",
                  // },
                ],
              },
            ],
          },
          {
            model: Karyawan,
            as: "karyawan_hr",
          },
        ],
        where: {
          id_karyawan: id_karyawan,
          dari: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
          sampai: {
            [Op.between]: [
              new Date(startDate).setHours(0, 0, 0, 0),
              new Date(endDate).setHours(23, 59, 59, 999),
            ],
          },
        },
      });
      const karyawanData = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
        include: [
          {
            model: MasterGradeHr,
            as: "grade",
          },
        ],
      });

      // buat tanggal sesuai format
      const resultPengajuanLebur = pengajuanLemburData.map((pengajuan) => {
        const datePengajuan = new Date(pengajuan.dari);
        const day = datePengajuan.getDate();
        const month = getMonthName((datePengajuan.getMonth() + 1).toString());
        const year = datePengajuan.getFullYear();

        return {
          tanggal_lembur: `${day}-${month}-${year}`,
          ...pengajuan.toJSON(),
        };
      });

      //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, obj);

      //hitung payroll berdasarkan data absensi dan pengajuan lembur
      const payroll = await hitungPayroll(
        absenResult,
        karyawanData,
        resultPengajuanLebur
      );
      res.status(200).json({
        data: payroll,
        //  lembur: resultPengajuanLebur
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

// Fungsi untuk menghitung lembur dengan memperhitungkan istirahat
const hitungPayroll = async (data, dataKaryawan, pengajuanLembur) => {
  const uangHadir = dataKaryawan.grade.uang_hadir;
  const uangMakan = dataKaryawan.grade.uang_makan;
  const upahPerHari = dataKaryawan.gaji;
  const uangLemburBiasa = dataKaryawan.grade.lembur_biasa;
  const uangLemburLibur = dataKaryawan.grade.lembur_libur;
  const uangMakanLembur = dataKaryawan.grade.uang_makan_lembur;
  const tunjanganKerjaMalam = dataKaryawan.grade.tunjangan_kerja_malam;
  const tunjanganKopi = dataKaryawan.grade.tunjangan_kopi;

  const typePenggajianKaryawan = dataKaryawan.tipe_penggajian;

  const masterPayrollData = await MasterPayroll.findByPk(1);

  return await Promise.all(
    data.map(async (absen) => {
      let payroll = {
        rincian: [],
        total: 0,
        data_pengajuan_lembur: null,
      };

      const groupedData = await pengajuanLembur.map((curr) => {
        const tanggal = curr.tanggal_lembur;

        if (tanggal == absen.tgl_keluar) {
          // Jika tanggal belum ada, buat entri baru

          payroll.data_pengajuan_lembur = curr;
        }
      });

      // // Ambil data istirahat berdasarkan hari
      // const istirahat = await MasterIstirahat.findAll({
      //     where: {
      //         hari: namaHari, // Filter berdasarkan nama hari
      //         jam_mulai: { [Op.lte]: absen.jam_keluar_shift }, // Istirahat mulai sebelum atau saat jam keluar shift
      //         jam_selesai: { [Op.gte]: absen.jam_masuk_shift } // Istirahat selesai setelah atau saat jam masuk shift
      //     }
      // });

      let jamLembur = 0;
      let jamIstirahat = 0;

      // Hitung durasi lembur berdasarkan jam keluar shift dan jam keluar
      const jamKeluarShift = new Date(`2024-11-19T${absen.jam_keluar_shift}`);
      const jamKeluar = new Date(absen.waktu_keluar);
      // jamLembur = (jamKeluar - jamKeluarShift) / (1000 * 60 * 60); // Hasil dalam jam
      //   jamLembur = payroll.data_pengajuan_lembur.lama_lembur_aktual;
      jamLembur = absen.jam_lembur;

      // // Jika ada waktu istirahat, kita akan kurangi durasi lembur dengan jam istirahat
      // istirahat.forEach((rest) => {
      //     const jamMulaiIstirahat = new Date(`2024-11-19T${rest.jam_mulai}`);
      //     const jamSelesaiIstirahat = new Date(`2024-11-19T${rest.jam_selesai}`);

      //     // Cek apakah waktu lembur tumpang tindih dengan waktu istirahat
      //     if (jamKeluar > jamMulaiIstirahat && jamKeluar < jamSelesaiIstirahat) {
      //         const durasiIstirahat = (jamSelesaiIstirahat - jamKeluar) / (1000 * 60 * 60); // Jam yang tumpang tindih
      //         jamIstirahat = Math.min(durasiIstirahat, jamLembur); // Jangan melebihi durasi lembur
      //     }
      // });

      // Durasi lembur setelah mengurangi istirahat
      jamLembur -= jamIstirahat;

      // Perhitungan payroll
      if (absen.status_absen === "masuk") {
        const banyakmakan = 1;
        payroll.rincian.push(
          `uangMakan: 1 x ${uangMakan} = ${banyakmakan * uangMakan}`
        );
        payroll.total += banyakmakan * uangMakan;

        //hanya untuk karyawan mingguan
        if (typePenggajianKaryawan === "mingguan") {
          payroll.rincian.push(
            `upahHarian: 1 x ${upahPerHari} = ${upahPerHari}`
          );
          payroll.total += upahPerHari;
        }
        //perhitungan tunjangan uang kopi untuk karyawan bulanan
        if (typePenggajianKaryawan === "bulanan") {
          payroll.rincian.push(
            `tunjanganKopi: 1 x ${upahPerHari} = ${upahPerHari}`
          );
          payroll.total += upahPerHari;
        }

        payroll.rincian.push(`uangHadir: 1 x ${uangHadir} =  ${uangHadir}`);
        payroll.total += uangHadir;
      }

      // Hitung uang lembur jika ada
      if (absen.status_lembur === "Lembur" && jamLembur > 0) {
        const banyakMakanLembur = Math.floor(
          jamLembur / masterPayrollData.uang_makan_lembur_per
        );

        payroll.rincian.push(
          `uangLembur: ${jamLembur} x ${uangLemburBiasa} = ${
            jamLembur * uangLemburBiasa
          }`
        );
        payroll.total += jamLembur * uangLemburBiasa;

        payroll.rincian.push(
          `uangMakanLembur: ${banyakMakanLembur} x ${uangMakanLembur} = ${
            banyakMakanLembur * uangMakanLembur
          }`
        );
        payroll.total += banyakMakanLembur * uangMakanLembur;
      }

      // Perhitungan sakit khusus untuk karyawan mingguan
      if (
        absen.status_absen === "sakit" &&
        typePenggajianKaryawan === "mingguan"
      ) {
        payroll.rincian.push(
          `upahHarianSakit: ${
            masterPayrollData.upah_sakit
          }% x ${upahPerHari} = ${
            (masterPayrollData.upah_sakit * upahPerHari) / 100
          } `
        );
        payroll.total += (masterPayrollData.upah_sakit * upahPerHari) / 100;
      }

      // Perhitungan tunjangan kerja malam khusus untuk karyawan mingguan
      if (absen.shift === "Shift 2" && typePenggajianKaryawan === "mingguan") {
        payroll.rincian.push(`tunjanganKerjaMalam: ${tunjanganKerjaMalam} `);
        payroll.total += tunjanganKerjaMalam;
      }

      // Tambahkan payroll ke dalam data absen
      return { ...absen, payroll };
    })
  );
};

function getMonthName(monthString) {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const monthNumber = parseInt(monthString);

  if (monthNumber < 1 || monthNumber > 12) {
    return "Bulan tidak valid";
  } else {
    return months[monthNumber - 1];
  }
}

module.exports = payrollController;
