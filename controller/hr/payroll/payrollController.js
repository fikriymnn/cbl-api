const { getAbsensiFunction } = require("../../../helper/absenFunction");
const Karyawan = require("../../../model/hr/karyawanModel");
const BiodataKaryawan = require("../../../model/hr/karyawan/karyawanBiodataModel");
const PengajuanLembur = require("../../../model/hr/pengajuanLembur/pengajuanLemburModel");
const KaryawanBiodata = require("../../../model/hr/karyawan/karyawanBiodataModel");
const MasterDivisi = require("../../../model/masterData/hr/masterDivisiModel");
const MasterDepartment = require("../../../model/masterData/hr/masterDeprtmentModel");
const MasterBagianHr = require("../../../model/masterData/hr/masterBagianModel");
const MasterJabatan = require("../../../model/masterData/hr/masterJabatanModel");
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

  // getPayrollAll: async (req, res) => {
  //   const { startDate, endDate } = req.query;

  //   try {
  //     // 1. Ambil semua data karyawan + data yang diperlukan dalam satu query
  //     const dataKaryawan = await BiodataKaryawan.findAll({
  //       where: { id_grade: { [Op.ne]: null } },
  //       include: [
  //         {
  //           model: KaryawanPotongan,
  //           as: "potongan_karyawan",
  //         },
  //         {
  //           model: Karyawan,
  //           as: "karyawan",
  //         },
  //         {
  //           model: MasterGradeHr,
  //           as: "grade",
  //         },
  //         // {
  //         //   model: MasterDivisi,
  //         //   as: "divisi",
  //         // },
  //         // {
  //         //   model: MasterDepartment,
  //         //   as: "department",
  //         // },
  //         // {
  //         //   model: MasterBagianHr,
  //         //   as: "bagian",
  //         // },
  //         // {
  //         //   model: MasterJabatan,
  //         //   as: "jabatan",
  //         // },
  //       ],
  //     });

  //     // 2. Ambil semua data pengajuan lembur sekaligus
  //     const allPengajuanLembur = await pengajuanLembur.findAll({
  //       where: {
  //         id_karyawan: { [Op.in]: dataKaryawan.map((k) => k.id_karyawan) },
  //         dari: {
  //           [Op.between]: [
  //             new Date(startDate).setHours(0, 0, 0, 0),
  //             new Date(endDate).setHours(23, 59, 59, 999),
  //           ],
  //         },
  //         sampai: {
  //           [Op.between]: [
  //             new Date(startDate).setHours(0, 0, 0, 0),
  //             new Date(endDate).setHours(23, 59, 59, 999),
  //           ],
  //         },
  //       },
  //       include: [
  //         {
  //           model: Karyawan,
  //           as: "karyawan",
  //         },
  //         {
  //           model: Karyawan,
  //           as: "karyawan_pengaju",
  //           include: [
  //             {
  //               model: KaryawanBiodata,
  //               as: "biodata_karyawan",
  //               include: [
  //                 // {
  //                 //   model: MasterDivisi,
  //                 //   as: "divisi",
  //                 // },
  //                 {
  //                   model: MasterDepartment,
  //                   as: "department",
  //                 },
  //                 // {
  //                 //   model: MasterBagianHr,
  //                 //   as: "bagian",
  //                 // },
  //               ],
  //             },
  //           ],
  //         },
  //         {
  //           model: Karyawan,
  //           as: "karyawan_hr",
  //         },
  //       ],
  //     });

  //     const resultPengajuanLebur = await allPengajuanLembur.map(
  //       (pengajuan) => ({
  //         tanggal_lembur: `${new Date(pengajuan.dari).getDate()}-${getMonthName(
  //           new Date(pengajuan.dari).getMonth() + 1
  //         )}-${new Date(pengajuan.dari).getFullYear()}`,
  //         ...pengajuan.toJSON(),
  //       })
  //     );

  //     let dataResult = {
  //       periode_dari: startDate,
  //       periode_sampai: endDate,
  //       total: 0,
  //       detail: [],
  //     };

  //     // 3. Loop karyawan dengan optimasi
  //     await Promise.all(
  //       dataKaryawan.map(async (data, i) => {
  //         if (i % 50 === 0)

  //         let obj = { id_karyawan: data.id_karyawan };

  //         // 4. Ambil data lembur dari array yang sudah ada
  //         const pengajuanLemburData = resultPengajuanLebur.filter(
  //           (lembur) => lembur.id_karyawan === data.id_karyawan
  //         );

  //         // 5. Ambil data absensi & hitung payroll secara paralel
  //         const absenResult = await getAbsensiFunction(startDate, endDate, obj);

  //         const payroll = await hitungPayroll(
  //           absenResult,
  //           data,
  //           pengajuanLemburData
  //         );

  //         dataResult.detail.push(payroll);
  //       })
  //     );

  //     // 6. Hitung total menggunakan reduce
  //     dataResult.total = dataResult.detail.reduce(
  //       (acc, curr) => acc + curr.summaryPayroll.total,
  //       0
  //     );

  //     res.status(200).json({ data: dataResult });
  //   } catch (error) {
  //     res.status(500).json({ msg: error.message });
  //   }
  // },

  getPayrollAll: async (req, res) => {
    const { startDate, endDate } = req.query;

    // const dataKaryawan = await BiodataKaryawan.findAll({
    //   where: { is_active: true, id_grade: { [Op.ne]: null } },
    // });

    try {
      // 1. Ambil semua data karyawan + data yang diperlukan dalam satu query
      const dataKaryawan = await BiodataKaryawan.findAll({
        where: { id_grade: { [Op.ne]: null } },
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
          {
            model: MasterDivisi,
            as: "divisi",
          },
          {
            model: MasterDepartment,
            as: "department",
          },
          {
            model: MasterBagianHr,
            as: "bagian",
          },
          {
            model: MasterJabatan,
            as: "jabatan",
          },
        ],
      });

      // 2. Ambil semua data pengajuan lembur sekaligus
      const allPengajuanLembur = await pengajuanLembur.findAll({
        where: {
          id_karyawan: { [Op.in]: dataKaryawan.map((k) => k.id_karyawan) },
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
      });

      // buat tanggal sesuai format
      const resultPengajuanLebur = allPengajuanLembur.map((pengajuan) => {
        const datePengajuan = new Date(pengajuan.dari);
        const day = datePengajuan.getDate();
        const month = getMonthName((datePengajuan.getMonth() + 1).toString());
        const year = datePengajuan.getFullYear();

        return {
          tanggal_lembur: `${day}-${month}-${year}`,
          ...pengajuan.toJSON(),
        };
      });

      let dataResult = {
        periode_dari: startDate,
        periode_sampai: endDate,
        total: 0,
        detail: [],
      };

      // //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, {
        id_grade: { [Op.ne]: null },
      });

      for (let i = 0; i < dataKaryawan.length; i++) {
        const data = dataKaryawan[i];
        let obj = {};
        obj.id_karyawan = data.id_karyawan;

        // 4. Ambil data lembur dari array yang sudah ada
        const pengajuanLemburData = resultPengajuanLebur.filter(
          (lembur) => lembur.id_karyawan === data.id_karyawan
        );

        //Ambil data lembur dari array yang sudah ada
        const absenResultFilter = absenResult.filter(
          (absen) => absen.userid === data.id_karyawan
        );

        // hitung payroll berdasarkan data absensi dan pengajuan lembur
        const payroll = await hitungPayroll(
          absenResultFilter,
          data,
          pengajuanLemburData
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

  getPayrollBulananAll: async (req, res) => {
    const { startDate, endDate } = req.query;

    // const dataKaryawan = await BiodataKaryawan.findAll({
    //   where: { is_active: true, id_grade: { [Op.ne]: null } },
    // });

    try {
      // 1. Ambil semua data karyawan + data yang diperlukan dalam satu query
      const dataKaryawan = await BiodataKaryawan.findAll({
        where: { id_grade: { [Op.ne]: null }, tipe_penggajian: "bulanan" },
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
          {
            model: MasterDivisi,
            as: "divisi",
          },
          {
            model: MasterDepartment,
            as: "department",
          },
          {
            model: MasterBagianHr,
            as: "bagian",
          },
          {
            model: MasterJabatan,
            as: "jabatan",
          },
        ],
      });

      let dataResult = {
        periode_dari: startDate,
        periode_sampai: endDate,
        total: 0,
        detail: [],
      };
      //console.log(1);

      // //ambil data dari absensi
      const absenResult = await getAbsensiFunction(startDate, endDate, {});
      // console.log(2);

      for (let i = 0; i < dataKaryawan.length; i++) {
        const data = dataKaryawan[i];
        let obj = {};
        obj.id_karyawan = data.id_karyawan;

        //Ambil data lembur dari array yang sudah ada
        const absenResultFilter = absenResult.filter(
          (absen) => absen.userid === data.id_karyawan
        );

        // hitung payroll berdasarkan data absensi dan pengajuan lembur
        const payroll = await hitungPayrollBulanan(absenResultFilter, data);

        dataResult.detail.push(payroll);
      }
      //console.log(3);

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
  const uangDinas = dataKaryawan.grade.uang_dinas;
  const tunjanganKerjaMalam = dataKaryawan.grade.tunjangan_kerja_malam;
  const tunjanganKopi = dataKaryawan.grade.tunjangan_kopi;

  //data dari karyawan
  const tipePenggajianKaryawan = dataKaryawan.tipe_penggajian;
  const potonganKaryawan = dataKaryawan.potongan_karyawan;
  const tipeKaryawan = dataKaryawan.tipe_karyawan;

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
    divisi:
      dataKaryawan.divisi == null ? null : dataKaryawan.divisi?.nama_divisi,
    department:
      dataKaryawan.department == null
        ? null
        : dataKaryawan.department.nama_department,
    id_department: dataKaryawan.id_department,
    jabatan:
      dataKaryawan.jabatan == null ? null : dataKaryawan.jabatan.nama_jabatan,
    tipe_karyawan: tipeKaryawan,
    tipe_penggajian: tipePenggajianKaryawan,
    rincian: [],
    upahHarianSakit: [],
    potonganPinjaman: null,
    potongan: [],
    potongan_terlambat: [],
    total_potongan: 0,
    total: 0,
    sub_total: 0,
    pembulatan: false,
    pengurangan_penambahan: 0,
  };

  //tambah data pengajuan pinjaman
  if (pengajuanPinjaman && tipePenggajianKaryawan == "mingguan") {
    summaryPayroll.potonganPinjaman = pengajuanPinjaman;

    //pengurangan nilai ke total gaji
    summaryPayroll.total -= pengajuanPinjaman.jumlah_cicilan;
    summaryPayroll.sub_total -= pengajuanPinjaman.jumlah_cicilan;
    summaryPayroll.total_potongan += pengajuanPinjaman.jumlah_cicilan;
  }

  //tambah data potogan jika ada
  if (tipePenggajianKaryawan == "mingguan") {
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
      summaryPayroll.sub_total -= dataPotongan.jumlah_potongan;
      summaryPayroll.total_potongan += dataPotongan.jumlah_potongan;
    }
  }

  const detailAbsensi = await Promise.all(
    data.map(async (absen) => {
      let payroll = {
        rincian: [],
        potongan: [],
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
      jamLembur = absen.jam_lembur_spl;

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
      if (
        (absen.status_absen === "masuk" &&
          (absen.status_keluar === "Keluar" ||
            absen.status_keluar === "Pulang Cepat")) ||
        absen.status_absen === "dinas"
      ) {
        // const banyakmakan = 1;
        // payroll.rincian.push({
        //   label: "uangMakan",
        //   jumlah: banyakmakan,
        //   nilai: uangMakan,
        //   total: banyakmakan * uangMakan,
        // });

        // payroll.total += banyakmakan * uangMakan;

        //hanya untuk karyawan mingguan
        if (tipePenggajianKaryawan === "mingguan") {
          payroll.rincian.push({
            label: "upahHarian",
            jumlah: 1,
            nilai: upahPerHari,
            total: upahPerHari,
          });

          payroll.total += upahPerHari;
        }
        //perhitungan tunjangan uang kopi untuk karyawan bulanan
        if (tipePenggajianKaryawan === "bulanan") {
          payroll.rincian.push({
            label: "tunjanganKopi",
            jumlah: 1,
            nilai: tunjanganKopi,
            total: tunjanganKopi,
          });

          payroll.total += tunjanganKopi;
        }

        // if (absen.status_absen === "dinas") {
        //   payroll.rincian.push({
        //     label: "uangDinas",
        //     jumlah: 1,
        //     nilai: uangDinas,
        //     total: uangDinas,
        //   });

        //   payroll.total += uangDinas;
        // }

        //untuk perhitungan terlambat
        if (
          tipePenggajianKaryawan === "mingguan" &&
          tipeKaryawan === "produksi" &&
          absen.status_masuk === "Terlambat "
        ) {
          if (absen.menit_terlambat > 1) {
            //untuk kondisi potong jam lembur
          }
        }
        // else if (
        //   (tipePenggajianKaryawan === "bulanan" || tipeKaryawan === "staff") &&
        //   absen.status_masuk === "Terlambat "
        // ) {
        //   summaryPayroll.potongan_terlambat.push({
        //     label: "potonganTerlambat",
        //     jumlah: absen.menit_terlambat,
        //     nilai: 20000,
        //     total: absen.menit_terlambat * 20000,
        //   });

        //   //pengurangan nilai ke total gaji
        //   summaryPayroll.total -= absen.menit_terlambat * 20000;
        //   summaryPayroll.sub_total -= absen.menit_terlambat * 20000;
        //   summaryPayroll.total_potongan += absen.menit_terlambat * 20000;

        //   payroll.rincian.push({
        //     label: "uangHadir",
        //     jumlah: 1,
        //     nilai: uangHadir,
        //     total: uangHadir,
        //   });
        // }
        else {
          payroll.rincian.push({
            label: "uangHadir",
            jumlah: 1,
            nilai: uangHadir,
            total: uangHadir,
          });
        }
      }

      // Hitung uang lembur jika ada
      if (absen.status_lembur === "Lembur" && jamLembur > 0) {
        const banyakMakanLembur = Math.floor(
          jamLembur / masterPayrollData.uang_makan_lembur_per
        );

        // menghitung uang lembur karyawan bulanan, jika jenis hari masuk libur makan dihitung uang lembur libur
        if (
          absen.jenis_hari_masuk === "Libur" &&
          tipePenggajianKaryawan === "bulanan"
        ) {
          payroll.rincian.push({
            label: "uangLemburLibur",
            jumlah: jamLembur,
            nilai: uangLemburLibur,
            total: jamLembur * uangLemburLibur,
          });
          payroll.total += jamLembur * uangLemburLibur;
        } else if (tipePenggajianKaryawan === "bulanan") {
          payroll.rincian.push({
            label: "uangLembur",
            jumlah: jamLembur,
            nilai: uangLemburBiasa,
            total: jamLembur * uangLemburBiasa,
          });
          payroll.total += jamLembur * uangLemburBiasa;
        }

        // menghitung uang lembur karyawan mingguan
        if (tipePenggajianKaryawan === "mingguan") {
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

      //perhitungan potongan terlambat
      // if (
      //   absen.status_masuk == "Terlambat " ||
      //   absen.status_masuk == "Terlambat : pribadi"
      // ) {
      //   payroll.rincian.push({
      //     label: "potonganTerlambat",
      //     jumlah: absen.menit_terlambat,
      //     nilai: 15000,
      //     total: absen.menit_terlambat * 15000,
      //   });

      //    payroll.total -= absen.menit_terlambat * 15000;
      // }

      // Perhitungan sakit khusus untuk karyawan mingguan
      if (
        absen.status_absen === "sakit" &&
        tipePenggajianKaryawan === "mingguan" &&
        tipeKaryawan === "produksi"
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
      if (absen.shift === "Shift 2" && tipePenggajianKaryawan === "mingguan") {
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
          summaryPayroll.sub_total += item.total;
        }
      });

      // Gabungkan rincian sakit payroll ke summaryPayroll
      summaryPayroll.upahHarianSakit.map((item) => {
        summaryPayroll.total += item.total;
        summaryPayroll.sub_total += item.total;
      });

      // Tambahkan payroll ke dalam data absen
      return { ...absen, payroll };
    })
  );

  //pembulatan bayaran dua digit terakhir
  const pembulatanBayaran = pembulatanAngka(summaryPayroll.sub_total);
  summaryPayroll.total = pembulatanBayaran.nilai;
  summaryPayroll.sub_total = pembulatanBayaran.nilai;
  summaryPayroll.pembulatan = pembulatanBayaran.pembulatan;
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
  const tipePenggajianKaryawan = dataKaryawan.tipe_penggajian;
  const tipeKaryawan = dataKaryawan.tipe_karyawan;
  const masterPayrollData = await MasterPayroll.findByPk(1);
  const pengajuanPinjaman = await PengajuanPinjaman.findOne({
    where: {
      id_karyawan: dataKaryawan.id_karyawan,
      status_pinjaman: "belum lunas",
    },
  });

  const lamaKerja = hitungTahunDari(dataKaryawan.tgl_masuk);

  let summaryPayroll = {
    nama_karyawan: dataKaryawan.karyawan.name,
    nik: dataKaryawan.nik,
    id_karyawan: dataKaryawan.id_karyawan,
    divisi:
      dataKaryawan.divisi == null ? null : dataKaryawan.divisi?.nama_divisi,
    department:
      dataKaryawan.department == null
        ? null
        : dataKaryawan.department.nama_department,
    id_department: dataKaryawan.id_department,
    jabatan:
      dataKaryawan.jabatan == null ? null : dataKaryawan.jabatan.nama_jabatan,
    tipe_karyawan: tipeKaryawan,
    tipe_penggajian: tipePenggajianKaryawan,
    gaji: gajiBulanan,
    potonganPinjaman: null,
    potonganSakit: [],
    potonganIzin: [],
    potonganMangkir: [],
    potongan: [],
    potongan_terlambat: [],
    total_potongan: 0,
    tmk: lamaKerja * 10000,
    sub_total: gajiBulanan + lamaKerja * 10000,
    total: gajiBulanan + lamaKerja * 10000,
    pembulatan: false,
    pengurangan_penambahan: 0,
  };

  if (pengajuanPinjaman) {
    summaryPayroll.potonganPinjaman = pengajuanPinjaman;

    //penambahan nilai ke total potongan
    summaryPayroll.total_potongan += pengajuanPinjaman.jumlah_cicilan;
    summaryPayroll.sub_total -= pengajuanPinjaman.jumlah_cicilan;

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
    summaryPayroll.sub_total -= dataPotongan.jumlah_potongan;
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
        summaryPayroll.sub_total -= Math.floor(
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
        summaryPayroll.sub_total -= Math.floor(gajiBulanan / 26);
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
        summaryPayroll.sub_total -= Math.floor(gajiBulanan / 26);
        summaryPayroll.total -= Math.floor(gajiBulanan / 26);
      }

      if (absen.status_masuk === "Terlambat ") {
        const jumlahPotonganterlambat = (gajiBulanan / 26 / 7).toFixed(0);

        const findTerlambat = summaryPayroll.potongan_terlambat.find(
          (dataT) => dataT.label === "potonganTerlambat"
        );
        if (!findTerlambat) {
          summaryPayroll.potongan_terlambat.push({
            label: "potonganTerlambat",
            jumlah: absen.menit_terlambat,
            nilai: jumlahPotonganterlambat,
            total: absen.menit_terlambat * jumlahPotonganterlambat,
          });
        } else {
          findTerlambat.jumlah += absen.menit_terlambat;
          findTerlambat.total +=
            absen.menit_terlambat * jumlahPotonganterlambat;
        }

        //pengurangan nilai ke total gaji
        summaryPayroll.total -= absen.menit_terlambat * jumlahPotonganterlambat;
        summaryPayroll.sub_total -=
          absen.menit_terlambat * jumlahPotonganterlambat;
        summaryPayroll.total_potongan +=
          absen.menit_terlambat * jumlahPotonganterlambat;
      }

      // Tambahkan payroll ke dalam data absen
      return { ...absen, payroll };
    })
  );
  //pembulatan bayaran dua digit terakhir
  const pembulatanBayaran = pembulatanAngka(summaryPayroll.sub_total);
  summaryPayroll.total = pembulatanBayaran.nilai;
  summaryPayroll.sub_total = pembulatanBayaran.nilai;
  summaryPayroll.pembulatan = pembulatanBayaran.pembulatan;
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

// Fungsi untuk membulatkan sesuai aturan
function pembulatanAngka(angka) {
  // Ambil dua digit terakhir
  const duaDigitTerakhir = angka % 100;

  // Jika dua digit terakhir adalah 00, tidak perlu pembulatan
  if (duaDigitTerakhir === 0) {
    return { nilai: angka, pembulatan: false };
  }

  // Tentukan hasil pembulatan
  let hasil =
    duaDigitTerakhir >= 50
      ? angka + (100 - duaDigitTerakhir) // Dibulatkan ke atas
      : angka - duaDigitTerakhir; // Dibulatkan ke bawah

  return { nilai: hasil, pembulatan: hasil !== angka };
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
