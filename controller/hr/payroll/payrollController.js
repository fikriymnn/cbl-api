const { getAbsensiFunction } = require("../../../helper/absenFunction");
const Karyawan = require("../../../model/hr/karyawanModel");
const BiodataKaryawan = require("../../../model/hr/karyawan/karyawanBiodataModel");
const PengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const MasterGradeHr = require("../../../model/masterData/hr/masterGradeModel");
const MasterPayroll = require("../../../model/masterData/hr/masterPayrollModel");
const pengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const PengajuanPinjaman = require("../../../model/hr/pengajuanPinjaman/pengajuanPinjamanModel");
const KaryawanPotongan = require("../../../model/hr/karyawan/karyawanPotonganModel");
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
            model: KaryawanPotongan,
            as: "potongan_karyawan",
          },
          {
            model: Karyawan,
            as: "karyawan",
          },
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

  getPayrollAll: async (req, res) => {
    const { startDate, endDate } = req.query;

    const dataKaryawan = await BiodataKaryawan.findAll({
      where: { is_active: true, id_grade: { [Op.ne]: null } },
    });

    try {
      let dataResult = {
        periode_dari: startDate,
        periode_sampai: endDate,
        total: 0,
        detail: [],
      };

      for (let i = 0; i < dataKaryawan.length; i++) {
        const data = dataKaryawan[i];
        let obj = {};
        obj.id_karyawan = data.id_karyawan;
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
            id_karyawan: data.id_karyawan,
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
          where: { id_karyawan: data.id_karyawan },
          include: [
            {
              model: KaryawanPotongan,
              as: "potongan_karyawan",
            },
            {
              model: Karyawan,
              as: "karyawan",
            },
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

        dataResult.detail.push(payroll);
      }

      // Menggunakan reduce untuk menjumlahkan nilai total
      const totalSum = dataResult.detail.reduce((accumulator, currentValue) => {
        return accumulator + currentValue.summaryPayroll.total;
      }, 0); // Nilai awal accumulator adalah 0

      dataResult.total = totalSum;

      res.status(200).json({
        data: dataResult,
        //  lembur: resultPengajuanLebur
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  getPayrollBulanan: async (req, res) => {
    const { id_karyawan, startDate, endDate } = req.query;

    let obj = {};
    if (id_karyawan) obj.id_karyawan = id_karyawan;

    try {
      const karyawanData = await KaryawanBiodata.findOne({
        where: { id_karyawan: id_karyawan },
        include: [
          {
            model: MasterGradeHr,
            as: "grade",
          },
          {
            model: KaryawanPotongan,
            as: "potongan_karyawan",
          },
        ],
      });

      //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, obj);

      //hitung payroll berdasarkan data absensi dan pengajuan lembur
      const payroll = await hitungPayrollBulanan(absenResult, karyawanData);
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
  //data dari grade
  const uangHadir = dataKaryawan.grade.uang_hadir;
  const uangMakan = dataKaryawan.grade.uang_makan;
  const upahPerHari = dataKaryawan.gaji;
  const uangLemburBiasa = dataKaryawan.grade.lembur_biasa;
  const uangLemburLibur = dataKaryawan.grade.lembur_libur;
  const uangMakanLembur = dataKaryawan.grade.uang_makan_lembur;
  const tunjanganKerjaMalam = dataKaryawan.grade.tunjangan_kerja_malam;
  const tunjanganKopi = dataKaryawan.grade.tunjangan_kopi;

  //data dari karyawan
  const typePenggajianKaryawan = dataKaryawan.tipe_penggajian;
  const potonganKaryawan = dataKaryawan.potongan_karyawan;
  const typeKaryawan = dataKaryawan.tipe_karyawan;

  const masterPayrollData = await MasterPayroll.findByPk(1);
  const pengajuanPinjaman = await PengajuanPinjaman.findOne({
    where: {
      id_karyawan: dataKaryawan.id_karyawan,
      status_pinjaman: "belum lunas",
    },
  });

  let summaryPayroll = {
    nama_karyawan: dataKaryawan.karyawan.name,
    nik: dataKaryawan.nik,
    id_karyawan: dataKaryawan.id_karyawan,
    rincian: [],
    upahHarianSakit: [],
    potonganPinjaman: null,
    potongan: [],
    total_potongan: 0,
    total: 0,
  };

  //tambah data pengajuan pinjaman
  if (pengajuanPinjaman && typePenggajianKaryawan == "mingguan") {
    summaryPayroll.potonganPinjaman = pengajuanPinjaman;

    //pengurangan nilai ke total gaji
    summaryPayroll.total -= pengajuanPinjaman.jumlah_cicilan;
    summaryPayroll.total_potongan += pengajuanPinjaman.jumlah_cicilan;
  }

  //tambah data potogan jika ada
  if (typePenggajianKaryawan == "mingguan") {
    for (let iPotongan = 0; iPotongan < potonganKaryawan.length; iPotongan++) {
      const dataPotongan = potonganKaryawan[iPotongan];
      summaryPayroll.potongan.push({
        label: dataPotongan.nama_potongan,
        jumlah: 1,
        nilai: dataPotongan.jumlah_potongan,
        total: dataPotongan.jumlah_potongan,
      });

      //pengurangan nilai ke total gaji
      summaryPayroll.total -= dataPotongan.jumlah_potongan;
      summaryPayroll.total_potongan += dataPotongan.jumlah_potongan;
    }
  }

  const detailAbsensi = await Promise.all(
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
        // const banyakmakan = 1;
        // payroll.rincian.push({
        //   label: "uangMakan",
        //   jumlah: banyakmakan,
        //   nilai: uangMakan,
        //   total: banyakmakan * uangMakan,
        // });

        // payroll.total += banyakmakan * uangMakan;

        //hanya untuk karyawan mingguan
        if (typePenggajianKaryawan === "mingguan") {
          payroll.rincian.push({
            label: "upahHarian",
            jumlah: 1,
            nilai: upahPerHari,
            total: upahPerHari,
          });

          payroll.total += upahPerHari;
        }
        //perhitungan tunjangan uang kopi untuk karyawan bulanan
        if (typePenggajianKaryawan === "bulanan") {
          payroll.rincian.push({
            label: "tunjanganKopi",
            jumlah: 1,
            nilai: tunjanganKopi,
            total: tunjanganKopi,
          });

          payroll.total += tunjanganKopi;
        }

        payroll.rincian.push({
          label: "uangHadir",
          jumlah: 1,
          nilai: uangHadir,
          total: uangHadir,
        });

        payroll.total += uangHadir;
      }

      // Hitung uang lembur jika ada
      if (absen.status_lembur === "Lembur" && jamLembur > 0) {
        const banyakMakanLembur = Math.floor(
          jamLembur / masterPayrollData.uang_makan_lembur_per
        );

        // menghitung uang lembur karyawan bulanan, jika jenis hari masuk libur makan dihitung uang lembur libur
        if (
          absen.jenis_hari_masuk === "Libur" &&
          typePenggajianKaryawan === "bulanan"
        ) {
          payroll.rincian.push({
            label: "uangLemburLibur",
            jumlah: jamLembur,
            nilai: uangLemburLibur,
            total: jamLembur * uangLemburLibur,
          });
          payroll.total += jamLembur * uangLemburLibur;
        } else if (typePenggajianKaryawan === "bulanan") {
          payroll.rincian.push({
            label: "uangLembur",
            jumlah: jamLembur,
            nilai: uangLemburBiasa,
            total: jamLembur * uangLemburBiasa,
          });
          payroll.total += jamLembur * uangLemburBiasa;
        }

        // menghitung uang lembur karyawan mingguan
        if (typePenggajianKaryawan === "mingguan") {
          payroll.rincian.push({
            label: "uangLembur",
            jumlah: jamLembur,
            nilai: uangLemburBiasa,
            total: jamLembur * uangLemburBiasa,
          });
          payroll.total += jamLembur * uangLemburBiasa;
        }

        //hitung uang makan lembur
        if (absen.jenis_hari_masuk === "Libur") {
          let jumlahMakanLemburLibur = 0;
          if (jamLembur >= 3) {
            jumlahMakanLemburLibur += 1;
          }
          if (jamLembur >= 5) {
            jumlahMakanLemburLibur += 1;
          }

          payroll.rincian.push({
            label: "uangMakanLembur",
            jumlah: jumlahMakanLemburLibur,
            nilai: uangMakanLembur,
            total: jumlahMakanLemburLibur * uangMakanLembur,
          });

          payroll.total += jumlahMakanLemburLibur * uangMakanLembur;
        } else {
          payroll.rincian.push({
            label: "uangMakanLembur",
            jumlah: banyakMakanLembur,
            nilai: uangMakanLembur,
            total: banyakMakanLembur * uangMakanLembur,
          });

          payroll.total += banyakMakanLembur * uangMakanLembur;
        }
      }

      // Perhitungan sakit khusus untuk karyawan mingguan
      if (
        absen.status_absen === "sakit" &&
        typePenggajianKaryawan === "mingguan"
      ) {
        summaryPayroll.upahHarianSakit.push({
          label: "upahHarianSakit",
          jumlah: `${masterPayrollData.upah_sakit}%`,
          nilai: upahPerHari,
          total: (masterPayrollData.upah_sakit * upahPerHari) / 100,
        });
        payroll.rincian.push({
          label: "upahHarianSakit",
          jumlah: `${masterPayrollData.upah_sakit}%`,
          nilai: upahPerHari,
          total: (masterPayrollData.upah_sakit * upahPerHari) / 100,
        });

        payroll.total += (masterPayrollData.upah_sakit * upahPerHari) / 100;
      }

      // Perhitungan tunjangan kerja malam khusus untuk karyawan mingguan
      if (absen.shift === "Shift 2" && typePenggajianKaryawan === "mingguan") {
        payroll.rincian.push({
          label: "tunjanganKerjaMalam",
          jumlah: 1,
          nilai: tunjanganKerjaMalam,
          total: tunjanganKerjaMalam,
        });
        payroll.total += tunjanganKerjaMalam;
      }
      // Gabungkan rincian payroll ke summaryPayroll
      payroll.rincian.forEach((item) => {
        if (item.label != "upahHarianSakit") {
          if (!summaryPayroll.rincian[item.label]) {
            summaryPayroll.rincian[item.label] = {
              jumlah: 0,
              nilai: item.nilai,
              total: 0,
            };
          }
          summaryPayroll.rincian[item.label].jumlah += item.jumlah;
          summaryPayroll.rincian[item.label].nilai = item.nilai;
          summaryPayroll.rincian[item.label].total =
            summaryPayroll.rincian[item.label].jumlah * item.nilai;
          summaryPayroll.total += item.total;
        }
      });

      // Gabungkan rincian sakit payroll ke summaryPayroll
      summaryPayroll.upahHarianSakit.map((item) => {
        summaryPayroll.total += item.total;
      });

      // Tambahkan payroll ke dalam data absen
      return { ...absen, payroll };
    })
  );
  // Ubah rincian summaryPayroll menjadi array
  summaryPayroll.rincian = Object.entries(summaryPayroll.rincian).map(
    ([label, { jumlah, nilai, total }]) => ({ label, jumlah, nilai, total })
  );

  return { summaryPayroll, detailAbsensi };
};

// Fungsi untuk menghitung lembur dengan memperhitungkan istirahat
const hitungPayrollBulanan = async (data, dataKaryawan) => {
  const gajiBulanan = dataKaryawan.gaji;
  const potonganKaryawan = dataKaryawan.potongan_karyawan;
  const masterPayrollData = await MasterPayroll.findByPk(1);
  const pengajuanPinjaman = await PengajuanPinjaman.findOne({
    where: {
      id_karyawan: dataKaryawan.id_karyawan,
      status_pinjaman: "belum lunas",
    },
  });

  const lamaKerja = hitungTahunDari(dataKaryawan.tgl_masuk);

  let summaryPayroll = {
    gaji: gajiBulanan,
    potonganPinjaman: null,
    potonganSakit: [],
    potonganIzin: [],
    potonganMangkir: [],
    potongan: [],
    total_potongan: 0,
    tmk: lamaKerja * 10000,
    total: gajiBulanan + lamaKerja * 10000,
  };

  if (pengajuanPinjaman) {
    summaryPayroll.potonganPinjaman = pengajuanPinjaman;

    //penambahan nilai ke total potongan
    summaryPayroll.total_potongan += pengajuanPinjaman.jumlah_cicilan;

    //pengurangan nilai ke total gaji
    summaryPayroll.total -= pengajuanPinjaman.jumlah_cicilan;
  }

  //tambah data potogan jika ada

  for (let iPotongan = 0; iPotongan < potonganKaryawan.length; iPotongan++) {
    const dataPotongan = potonganKaryawan[iPotongan];
    summaryPayroll.potongan.push({
      label: dataPotongan.nama_potongan,
      jumlah: 1,
      nilai: dataPotongan.jumlah_potongan,
      total: dataPotongan.jumlah_potongan,
    });

    //penambahan nilai ke total potongan
    summaryPayroll.total_potongan += dataPotongan.jumlah_potongan;

    //pengurangan nilai ke total gaji
    summaryPayroll.total -= dataPotongan.jumlah_potongan;
  }

  const detailAbsensi = await Promise.all(
    data.map(async (absen) => {
      let payroll = {
        rincian: [],
        total: 0,
      };

      // Perhitungan sakit
      if (absen.status_absen === "sakit") {
        summaryPayroll.potonganSakit.push({
          label: "potonganSakit",
          jumlah: `${masterPayrollData.upah_sakit}%`,
          nilai: `${masterPayrollData.upah_sakit}% x ${gajiBulanan} / 26 `,
          total: Math.floor(
            (masterPayrollData.upah_sakit * gajiBulanan) / 100 / 26
          ),
        });

        //penambahan nilai ke total potongan
        summaryPayroll.total_potongan += Math.floor(
          (masterPayrollData.upah_sakit * gajiBulanan) / 100 / 26
        );

        //pengurangan nilai ke total gaji
        summaryPayroll.total -= Math.floor(
          (masterPayrollData.upah_sakit * gajiBulanan) / 100 / 26
        );
      }
      // Perhitungan izin
      if (absen.status_absen === "izin") {
        summaryPayroll.potonganIzin.push({
          label: "potonganIzin",
          jumlah: 1,
          nilai: `${gajiBulanan} / 26`,
          total: Math.floor(gajiBulanan / 26),
        });

        summaryPayroll.total_potongan += Math.floor(gajiBulanan / 26);

        summaryPayroll.total -= Math.floor(gajiBulanan / 26);
      }

      // Perhitungan izin
      if (absen.status_absen === "mangkir") {
        summaryPayroll.potonganMangkir.push({
          label: "potonganMangkir",
          jumlah: 1,
          nilai: `${gajiBulanan} / 26`,
          total: Math.floor(gajiBulanan / 26),
        });

        summaryPayroll.total_potongan += Math.floor(gajiBulanan / 26);

        summaryPayroll.total -= Math.floor(gajiBulanan / 26);
      }

      // Tambahkan payroll ke dalam data absen
      return { ...absen, payroll };
    })
  );
  //   // Ubah rincian summaryPayroll menjadi array
  //   summaryPayroll.rincian = Object.entries(summaryPayroll.rincian).map(
  //     ([label, { jumlah, nilai, total }]) => ({ label, jumlah, nilai, total })
  //   );

  return { summaryPayroll, detailAbsensi };
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

function hitungTahunDari(tanggal) {
  const sekarang = new Date(); // Tanggal hari ini
  const tanggalTertentu = new Date(tanggal); // Format tanggal: YYYY-MM-DD

  const selisihTahun = sekarang.getFullYear() - tanggalTertentu.getFullYear();

  // Periksa apakah bulan dan hari sudah dilewati tahun ini
  const belumLewat =
    sekarang.getMonth() < tanggalTertentu.getMonth() ||
    (sekarang.getMonth() === tanggalTertentu.getMonth() &&
      sekarang.getDate() < tanggalTertentu.getDate());

  return belumLewat ? 0 : selisihTahun;
}

module.exports = payrollController;
